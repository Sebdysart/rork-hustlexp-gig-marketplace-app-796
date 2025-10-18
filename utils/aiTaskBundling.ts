import { Task, User } from '@/types';

export interface TaskBundle {
  id: string;
  tasks: Task[];
  totalPay: number;
  totalXP: number;
  totalDistance: number;
  estimatedDuration: string;
  routeOptimized: boolean;
  potentialBonus: number;
  reasoning: string;
  efficiencyScore: number;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function optimizeRoute(tasks: Task[], userLocation: { lat: number; lng: number }): Task[] {
  if (tasks.length <= 2) return tasks;

  const unvisited = [...tasks];
  const route: Task[] = [];
  let current = userLocation;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    unvisited.forEach((task, index) => {
      const dist = calculateDistance(
        current.lat,
        current.lng,
        task.location.lat,
        task.location.lng
      );
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = index;
      }
    });

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearest);
    current = nearest.location;
  }

  return route;
}

export async function suggestTaskBundles(
  currentTask: Task,
  availableTasks: Task[],
  userLocation: { lat: number; lng: number },
  user?: User
): Promise<TaskBundle[]> {
  const bundles: TaskBundle[] = [];

  const nearbyTasks = availableTasks.filter(task => {
    if (task.id === currentTask.id) return false;
    if (task.status !== 'open') return false;

    const distance = calculateDistance(
      currentTask.location.lat,
      currentTask.location.lng,
      task.location.lat,
      task.location.lng
    );

    return distance <= 5;
  });

  if (nearbyTasks.length === 0) return [];

  const sameCategoryTasks = nearbyTasks.filter(t => t.category === currentTask.category);
  if (sameCategoryTasks.length > 0) {
    const tasksToBundle = sameCategoryTasks.slice(0, 3);
    const optimizedRoute = optimizeRoute([currentTask, ...tasksToBundle], userLocation);
    
    let totalDistance = 0;
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
      totalDistance += calculateDistance(
        optimizedRoute[i].location.lat,
        optimizedRoute[i].location.lng,
        optimizedRoute[i + 1].location.lat,
        optimizedRoute[i + 1].location.lng
      );
    }

    const totalPay = optimizedRoute.reduce((sum, t) => sum + t.payAmount, 0);
    const totalXP = optimizedRoute.reduce((sum, t) => sum + t.xpReward, 0);
    const bonusMultiplier = optimizedRoute.length >= 3 ? 1.15 : 1.1;
    const potentialBonus = Math.floor(totalPay * (bonusMultiplier - 1));

    bundles.push({
      id: `bundle-category-${Date.now()}`,
      tasks: optimizedRoute,
      totalPay: totalPay + potentialBonus,
      totalXP: Math.floor(totalXP * bonusMultiplier),
      totalDistance,
      estimatedDuration: `${optimizedRoute.length * 1.5}-${optimizedRoute.length * 2.5} hours`,
      routeOptimized: true,
      potentialBonus,
      reasoning: `All ${optimizedRoute.length} tasks are ${currentTask.category} jobs within ${totalDistance.toFixed(1)} miles. Complete them together for a ${Math.round((bonusMultiplier - 1) * 100)}% bonus!`,
      efficiencyScore: 95
    });
  }

  const proximityTasks = nearbyTasks
    .filter(t => !sameCategoryTasks.includes(t))
    .sort((a, b) => {
      const distA = calculateDistance(
        currentTask.location.lat,
        currentTask.location.lng,
        a.location.lat,
        a.location.lng
      );
      const distB = calculateDistance(
        currentTask.location.lat,
        currentTask.location.lng,
        b.location.lat,
        b.location.lng
      );
      return distA - distB;
    })
    .slice(0, 2);

  if (proximityTasks.length > 0) {
    const optimizedRoute = optimizeRoute([currentTask, ...proximityTasks], userLocation);
    
    let totalDistance = 0;
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
      totalDistance += calculateDistance(
        optimizedRoute[i].location.lat,
        optimizedRoute[i].location.lng,
        optimizedRoute[i + 1].location.lat,
        optimizedRoute[i + 1].location.lng
      );
    }

    const totalPay = optimizedRoute.reduce((sum, t) => sum + t.payAmount, 0);
    const totalXP = optimizedRoute.reduce((sum, t) => sum + t.xpReward, 0);
    const bonusMultiplier = 1.08;
    const potentialBonus = Math.floor(totalPay * (bonusMultiplier - 1));

    bundles.push({
      id: `bundle-proximity-${Date.now()}`,
      tasks: optimizedRoute,
      totalPay: totalPay + potentialBonus,
      totalXP: Math.floor(totalXP * bonusMultiplier),
      totalDistance,
      estimatedDuration: `${optimizedRoute.length * 1.5}-${optimizedRoute.length * 2.5} hours`,
      routeOptimized: true,
      potentialBonus,
      reasoning: `${optimizedRoute.length} nearby tasks within ${totalDistance.toFixed(1)} miles. Knock them out in one trip for extra pay!`,
      efficiencyScore: 82
    });
  }

  if (user?.skills && user.skills.length > 0) {
    const skillMatchTasks = nearbyTasks.filter(task => 
      task.requiredSkills?.some(skill => user.skills?.includes(skill))
    ).slice(0, 2);

    if (skillMatchTasks.length > 0) {
      const optimizedRoute = optimizeRoute([currentTask, ...skillMatchTasks], userLocation);
      
      let totalDistance = 0;
      for (let i = 0; i < optimizedRoute.length - 1; i++) {
        totalDistance += calculateDistance(
          optimizedRoute[i].location.lat,
          optimizedRoute[i].location.lng,
          optimizedRoute[i + 1].location.lat,
          optimizedRoute[i + 1].location.lng
        );
      }

      const totalPay = optimizedRoute.reduce((sum, t) => sum + t.payAmount, 0);
      const totalXP = optimizedRoute.reduce((sum, t) => sum + t.xpReward, 0);
      const bonusMultiplier = 1.12;
      const potentialBonus = Math.floor(totalPay * (bonusMultiplier - 1));

      bundles.push({
        id: `bundle-skills-${Date.now()}`,
        tasks: optimizedRoute,
        totalPay: totalPay + potentialBonus,
        totalXP: Math.floor(totalXP * bonusMultiplier),
        totalDistance,
        estimatedDuration: `${optimizedRoute.length * 1.5}-${optimizedRoute.length * 2.5} hours`,
        routeOptimized: true,
        potentialBonus,
        reasoning: `These tasks match your skills and are nearby. Perfect combo for efficiency!`,
        efficiencyScore: 90
      });
    }
  }

  return bundles.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}

export function calculateBundleSavings(bundle: TaskBundle, individualTravelTime: number): {
  timeSaved: string;
  gasSaved: number;
  efficiencyGain: number;
} {
  const optimizedTravelTime = bundle.totalDistance / 30 * 60;
  const unoptimizedTravelTime = bundle.tasks.length * individualTravelTime;
  const timeSavedMinutes = unoptimizedTravelTime - optimizedTravelTime;

  const avgMPG = 25;
  const gasPrice = 3.5;
  const gasSaved = ((unoptimizedTravelTime - optimizedTravelTime) / 60 * 30 / avgMPG) * gasPrice;

  const efficiencyGain = (timeSavedMinutes / unoptimizedTravelTime) * 100;

  return {
    timeSaved: `${Math.round(timeSavedMinutes)} min`,
    gasSaved: Math.max(0, gasSaved),
    efficiencyGain: Math.min(100, Math.max(0, efficiencyGain))
  };
}
