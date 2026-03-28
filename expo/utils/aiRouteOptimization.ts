import { Task, User } from '@/types';

export interface OptimizedRoute {
  tasks: Task[];
  totalDistance: number;
  totalDuration: number;
  totalEarnings: number;
  earningsPerHour: number;
  sequence: RouteStop[];
  mapUrl?: string;
  savingsVsUnoptimized: {
    distanceSaved: number;
    timeSaved: number;
    costSaved: number;
  };
}

export interface RouteStop {
  taskId: string;
  order: number;
  arrivalTime: string;
  departureTime: string;
  distanceFromPrevious: number;
  durationFromPrevious: number;
  address: string;
  taskDuration: number;
}

export interface RouteOptimizationParams {
  startLocation: { lat: number; lng: number; address: string };
  endLocation?: { lat: number; lng: number; address: string };
  startTime: Date;
  maxTotalDuration?: number;
  prioritizeEarnings?: boolean;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateDriveTime(distanceKm: number): number {
  const avgSpeedKmh = 40;
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60);
}

function estimateTaskDuration(task: Task): number {
  if (task.estimatedDuration) {
    const match = task.estimatedDuration.match(/(\d+)/);
    if (match) return parseInt(match[1]);
  }

  const categoryDefaults: Record<string, number> = {
    cleaning: 90,
    delivery: 30,
    errands: 45,
    moving: 180,
    handyman: 120,
    tech: 60,
    creative: 120,
    home_repair: 150,
    babysitting: 180,
    pet_care: 60,
    tutoring: 60,
    nursing: 120,
    virtual: 60,
    ai_automation: 90,
    photography: 120,
    data_entry: 60,
    virtual_assistant: 90,
    content_creation: 120,
  };

  return categoryDefaults[task.category] || 60;
}

function greedyTSP(
  start: { lat: number; lng: number },
  tasks: Task[],
  end?: { lat: number; lng: number }
): Task[] {
  const unvisited = [...tasks];
  const route: Task[] = [];
  let currentLocation = start;

  while (unvisited.length > 0) {
    let nearestTask = unvisited[0];
    let nearestDistance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      nearestTask.location.lat,
      nearestTask.location.lng
    );

    for (let i = 1; i < unvisited.length; i++) {
      const task = unvisited[i];
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        task.location.lat,
        task.location.lng
      );

      if (distance < nearestDistance) {
        nearestTask = task;
        nearestDistance = distance;
      }
    }

    route.push(nearestTask);
    currentLocation = nearestTask.location;
    unvisited.splice(unvisited.indexOf(nearestTask), 1);
  }

  return route;
}

function twoOptImprovement(route: Task[], maxIterations: number = 100): Task[] {
  let improved = true;
  let iterations = 0;
  let currentRoute = [...route];

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < currentRoute.length - 1; i++) {
      for (let j = i + 1; j < currentRoute.length; j++) {
        const newRoute = [...currentRoute];
        
        const segment = newRoute.slice(i, j + 1);
        newRoute.splice(i, segment.length, ...segment.reverse());

        const currentDist = calculateRouteDistance(currentRoute);
        const newDist = calculateRouteDistance(newRoute);

        if (newDist < currentDist) {
          currentRoute = newRoute;
          improved = true;
        }
      }
    }
  }

  return currentRoute;
}

function calculateRouteDistance(tasks: Task[]): number {
  let totalDistance = 0;
  for (let i = 0; i < tasks.length - 1; i++) {
    totalDistance += calculateDistance(
      tasks[i].location.lat,
      tasks[i].location.lng,
      tasks[i + 1].location.lat,
      tasks[i + 1].location.lng
    );
  }
  return totalDistance;
}

export async function optimizeRoute(
  tasks: Task[],
  params: RouteOptimizationParams,
  useAI: boolean = true
): Promise<OptimizedRoute> {
  console.log('[Route Optimization] Optimizing route for', tasks.length, 'tasks');

  if (tasks.length === 0) {
    return {
      tasks: [],
      totalDistance: 0,
      totalDuration: 0,
      totalEarnings: 0,
      earningsPerHour: 0,
      sequence: [],
      savingsVsUnoptimized: {
        distanceSaved: 0,
        timeSaved: 0,
        costSaved: 0,
      },
    };
  }

  const greedyRoute = greedyTSP(params.startLocation, tasks, params.endLocation);
  
  const optimizedRoute = twoOptImprovement(greedyRoute);

  let currentTime = new Date(params.startTime);
  let currentLocation = params.startLocation;
  const sequence: RouteStop[] = [];
  let totalDistance = 0;
  let totalDuration = 0;
  let totalEarnings = 0;

  for (let i = 0; i < optimizedRoute.length; i++) {
    const task = optimizedRoute[i];
    const distanceToTask = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      task.location.lat,
      task.location.lng
    );
    const driveTime = estimateDriveTime(distanceToTask);
    const taskDuration = estimateTaskDuration(task);

    const arrivalTime = new Date(currentTime.getTime() + driveTime * 60000);
    const departureTime = new Date(arrivalTime.getTime() + taskDuration * 60000);

    sequence.push({
      taskId: task.id,
      order: i + 1,
      arrivalTime: arrivalTime.toISOString(),
      departureTime: departureTime.toISOString(),
      distanceFromPrevious: distanceToTask,
      durationFromPrevious: driveTime,
      address: task.location.address,
      taskDuration,
    });

    totalDistance += distanceToTask;
    totalDuration += driveTime + taskDuration;
    totalEarnings += task.payAmount;
    currentTime = departureTime;
    currentLocation = task.location;
  }

  if (params.endLocation) {
    const returnDistance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      params.endLocation.lat,
      params.endLocation.lng
    );
    const returnTime = estimateDriveTime(returnDistance);
    totalDistance += returnDistance;
    totalDuration += returnTime;
  }

  const earningsPerHour = totalDuration > 0 ? (totalEarnings / totalDuration) * 60 : 0;

  const unoptimizedDistance = calculateRouteDistance(tasks);
  const unoptimizedDuration = unoptimizedDistance * 1.5;

  const distanceSaved = unoptimizedDistance - totalDistance;
  const timeSaved = unoptimizedDuration - totalDuration;
  const costSaved = distanceSaved * 0.5;

  return {
    tasks: optimizedRoute,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration: Math.round(totalDuration),
    totalEarnings: Math.round(totalEarnings),
    earningsPerHour: Math.round(earningsPerHour * 100) / 100,
    sequence,
    savingsVsUnoptimized: {
      distanceSaved: Math.round(distanceSaved * 10) / 10,
      timeSaved: Math.round(timeSaved),
      costSaved: Math.round(costSaved * 100) / 100,
    },
  };
}

export async function suggestBestTaskCombinations(
  availableTasks: Task[],
  user: User,
  params: RouteOptimizationParams,
  useAI: boolean = true
): Promise<{
  combinations: {
    tasks: Task[];
    score: number;
    earnings: number;
    duration: number;
    distance: number;
    earningsPerHour: number;
    reasoning: string;
  }[];
}> {
  console.log('[Route Optimization] Finding best task combinations');

  const maxCombinations = 5;
  const combinations: {
    tasks: Task[];
    score: number;
    earnings: number;
    duration: number;
    distance: number;
    earningsPerHour: number;
    reasoning: string;
  }[] = [];

  const sortedTasks = [...availableTasks].sort((a, b) => b.payAmount - a.payAmount);

  for (let size = 1; size <= Math.min(5, sortedTasks.length); size++) {
    for (let i = 0; i <= sortedTasks.length - size; i++) {
      const taskSubset = sortedTasks.slice(i, i + size);
      const route = await optimizeRoute(taskSubset, params, false);

      if (params.maxTotalDuration && route.totalDuration > params.maxTotalDuration) {
        continue;
      }

      const score =
        route.earningsPerHour * 0.5 +
        (route.totalEarnings / 100) * 0.3 +
        (1 / (route.totalDistance + 1)) * 20;

      let reasoning = `${size} task${size > 1 ? 's' : ''} earning $${route.totalEarnings} in ${route.totalDuration} mins`;

      combinations.push({
        tasks: taskSubset,
        score,
        earnings: route.totalEarnings,
        duration: route.totalDuration,
        distance: route.totalDistance,
        earningsPerHour: route.earningsPerHour,
        reasoning,
      });
    }
  }

  combinations.sort((a, b) => b.score - a.score);

  return {
    combinations: combinations.slice(0, maxCombinations),
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function getEfficiencyColor(earningsPerHour: number): string {
  if (earningsPerHour >= 50) return '#00FF88';
  if (earningsPerHour >= 35) return '#00D9FF';
  if (earningsPerHour >= 25) return '#FFB800';
  return '#FF6B6B';
}

export function getEfficiencyLabel(earningsPerHour: number): string {
  if (earningsPerHour >= 50) return 'Excellent';
  if (earningsPerHour >= 35) return 'Great';
  if (earningsPerHour >= 25) return 'Good';
  return 'Fair';
}
