import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Easing,
  Modal,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { 
  Sparkles, Send, Loader, MessageCircle, Brain, Mic, Check,
  Star, MapPin, DollarSign, ArrowRight, Zap,
  X, HelpCircle, TrendingUp, Award, ChevronLeft, ChevronRight
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

import Colors from '@/constants/colors';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import Confetti from '@/components/Confetti';
import { triggerHaptic } from '@/utils/haptics';
import { UserRole, UserMode, Task } from '@/types';
import { TradeCategory } from '@/constants/tradesmen';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  uiComponents?: UIComponent[];
}

interface UIComponent {
  type: 'role_cards' | 'skill_chips' | 'availability_picker' | 'earnings_preview' | 'confirmation' | 'map_preview';
  data?: any;
}

interface ExtractedData {
  name?: string;
  intent?: 'worker' | 'poster' | 'both';
  categories?: string[];
  trades?: TradeCategory[];
  availability?: string[];
  language?: string;
  mode?: UserMode;
  email?: string;
  location?: { lat: number; lng: number; address: string };
  travelRadius?: number;
}

interface PredictiveSuggestion {
  text: string;
  action: () => void;
}

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
}

interface ContextualBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  visible: boolean;
}

type OnboardingStep = 'welcome' | 'name' | 'role' | 'skills' | 'availability' | 'location' | 'confirmation' | 'complete';
type AvatarExpression = 'neutral' | 'happy' | 'thinking' | 'excited' | 'celebrating';

const PARTICLE_COUNT = 60;
const FIREWORK_PARTICLE_COUNT = 120;

export default function AIOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, tasks: allTasks } = useApp();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [showConfetti, setShowConfetti] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [predictiveSuggestions, setPredictiveSuggestions] = useState<PredictiveSuggestion[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const [avatarExpression, setAvatarExpression] = useState<AvatarExpression>('neutral');
  const [contextualBubbles, setContextualBubbles] = useState<ContextualBubble[]>([]);
  const [typingPrediction, setTypingPrediction] = useState('');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [fireworkParticles, setFireworkParticles] = useState<Particle[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const avatarPulse = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const hologramAnim = useRef(new Animated.Value(0)).current;
  const cardFlipAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const chartBarAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const avatarRotate = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  // Gesture for swiping between steps
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          // Swipe right - go back
          handleSwipeBack();
        } else if (gestureState.dx < -50) {
          // Swipe left - go forward
          handleSwipeForward();
        }
      },
    })
  ).current;

  useEffect(() => {
    startAvatarPulse();
    startHologramEffect();
    initializeParticles();
    startBreatheAnimation();
    showWelcomeMessage();
    startMessageAnimation();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    if (progress === 100) {
      triggerFireworks();
    }
  }, [progress]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (input.length > 3) {
      generateTypingPrediction(input);
    } else {
      setTypingPrediction('');
    }
  }, [input]);

  const startMessageAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const generateTypingPrediction = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (currentStep === 'name') {
      if (lowerText.includes('my name')) {
        setTypingPrediction(' is...');
      }
    } else if (currentStep === 'skills') {
      if (lowerText.includes('i can')) {
        setTypingPrediction(' do deliveries and moving');
      } else if (lowerText.includes('good at')) {
        setTypingPrediction(' cleaning and pet care');
      }
    } else if (currentStep === 'availability') {
      if (lowerText.includes('i')) {
        setTypingPrediction("'m available weekends");
      }
    }
  };

  const showContextualBubble = (text: string, delay: number = 2000) => {
    const bubble: ContextualBubble = {
      id: `bubble-${Date.now()}`,
      text,
      x: Math.random() * (SCREEN_WIDTH - 200),
      y: SCREEN_HEIGHT * 0.3 + Math.random() * 100,
      visible: true,
    };
    
    setContextualBubbles(prev => [...prev, bubble]);
    
    Animated.sequence([
      Animated.timing(bubbleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(delay),
      Animated.timing(bubbleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setContextualBubbles(prev => prev.filter(b => b.id !== bubble.id));
    });
  };

  const initializeParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      newParticles.push({
        id: i,
        x: new Animated.Value(Math.random() * SCREEN_WIDTH),
        y: new Animated.Value(Math.random() * SCREEN_HEIGHT),
        scale: new Animated.Value(Math.random() * 0.5 + 0.3),
        opacity: new Animated.Value(Math.random() * 0.3 + 0.1),
      });
    }
    setParticles(newParticles);
    animateParticles(newParticles);
  };

  const animateParticles = (particleList: Particle[]) => {
    particleList.forEach((particle, index) => {
      const randomDelay = Math.random() * 2000;
      const randomDuration = 8000 + Math.random() * 4000;

      Animated.loop(
        Animated.sequence([
          Animated.delay(randomDelay),
          Animated.parallel([
            Animated.timing(particle.x, {
              toValue: Math.random() * SCREEN_WIDTH,
              duration: randomDuration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: Math.random() * SCREEN_HEIGHT,
              duration: randomDuration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: Math.random() * 0.4 + 0.2,
                duration: randomDuration / 2,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: Math.random() * 0.2 + 0.05,
                duration: randomDuration / 2,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      ).start();
    });
  };

  const triggerFireworks = () => {
    setShowFireworks(true);
    const newFireworkParticles: Particle[] = [];
    
    for (let i = 0; i < FIREWORK_PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / FIREWORK_PARTICLE_COUNT;
      const velocity = Math.random() * 150 + 100;
      
      newFireworkParticles.push({
        id: i,
        x: new Animated.Value(SCREEN_WIDTH / 2),
        y: new Animated.Value(SCREEN_HEIGHT / 2),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
      });
    }
    
    setFireworkParticles(newFireworkParticles);
    
    newFireworkParticles.forEach((particle, index) => {
      const angle = (Math.PI * 2 * index) / FIREWORK_PARTICLE_COUNT;
      const velocity = Math.random() * 200 + 150;
      const targetX = SCREEN_WIDTH / 2 + Math.cos(angle) * velocity;
      const targetY = SCREEN_HEIGHT / 2 + Math.sin(angle) * velocity;
      
      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: targetX,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: targetY,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    setTimeout(() => {
      setShowFireworks(false);
      setFireworkParticles([]);
    }, 1500);
  };

  const playHapticSymphony = (pattern: 'success' | 'warning' | 'celebration') => {
    if (Platform.OS === 'web') return;

    switch (pattern) {
      case 'success':
        triggerHaptic('light');
        setTimeout(() => triggerHaptic('medium'), 100);
        break;
      case 'warning':
        triggerHaptic('medium');
        setTimeout(() => triggerHaptic('medium'), 150);
        break;
      case 'celebration':
        triggerHaptic('success');
        setTimeout(() => triggerHaptic('light'), 100);
        setTimeout(() => triggerHaptic('light'), 200);
        setTimeout(() => triggerHaptic('medium'), 300);
        setTimeout(() => triggerHaptic('success'), 500);
        break;
    }
  };

  const changeAvatarExpression = (expression: AvatarExpression) => {
    setAvatarExpression(expression);
    
    // Animate avatar based on expression
    switch (expression) {
      case 'happy':
        Animated.spring(avatarScale, {
          toValue: 1.2,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }).start(() => {
          Animated.spring(avatarScale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        });
        break;
      case 'thinking':
        Animated.loop(
          Animated.sequence([
            Animated.timing(avatarRotate, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(avatarRotate, {
              toValue: -1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case 'excited':
        Animated.sequence([
          Animated.timing(avatarScale, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(avatarScale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      case 'celebrating':
        Animated.loop(
          Animated.sequence([
            Animated.timing(avatarRotate, {
              toValue: 2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(avatarRotate, {
              toValue: -2,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
    }
  };

  const animateEarningsChart = () => {
    chartBarAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.spring(anim, {
          toValue: 1,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleSwipeBack = () => {
    if (currentStep === 'name' || currentStep === 'welcome') return;
    
    triggerHaptic('light');
    showContextualBubble('💡 Going back a step');
  };

  const handleSwipeForward = () => {
    if (!canSwipeForward()) return;
    
    triggerHaptic('light');
    showContextualBubble('✨ Moving forward!');
  };

  const canSwipeForward = () => {
    switch (currentStep) {
      case 'name':
        return !!extractedData.name;
      case 'role':
        return !!extractedData.intent;
      case 'skills':
        return (extractedData.categories?.length || 0) > 0 || (extractedData.trades?.length || 0) > 0;
      default:
        return false;
    }
  };

  const startAvatarPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, {
          toValue: 1.15,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startHologramEffect = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hologramAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(hologramAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startBreatheAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.08,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const triggerCardFlip = useCallback(() => {
    Animated.sequence([
      Animated.timing(cardFlipAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardFlipAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showWelcomeMessage = async () => {
    changeAvatarExpression('happy');
    await new Promise(resolve => setTimeout(resolve, 500));
    addAIMessage("Hey there! I'm HUSTLEAI 👋", 'welcome');
    playHapticSymphony('success');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    changeAvatarExpression('excited');
    addAIMessage("Let me help you set up your account in about 60 seconds.", 'welcome');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    showContextualBubble('💡 Tip: You can use voice or text!', 3000);
    askForName();
  };

  const askForName = () => {
    changeAvatarExpression('neutral');
    addAIMessage("What should I call you?", 'name');
    setPredictiveSuggestions([
      { text: "Use my real name", action: () => setInput('') },
      { text: "Pick a cool username", action: () => setInput('') },
    ]);
    setProgress(10);
    showContextualBubble('✨ Pro tip: Your name will be visible to others', 4000);
  };

  const askForRole = (name: string) => {
    changeAvatarExpression('happy');
    addAIMessage(`${name} - I like it! ✨\n\nWhat brings you to HustleXP?`, 'role', [
      {
        type: 'role_cards',
        data: {
          roles: [
            {
              id: 'worker',
              icon: '💪',
              title: 'HUSTLER',
              subtitle: 'Make money doing tasks',
              description: 'Find gigs, complete tasks, earn cash',
            },
            {
              id: 'poster',
              icon: '📋',
              title: 'POSTER',
              subtitle: 'Get tasks done for you',
              description: 'Hire workers, post jobs, get help',
            },
            {
              id: 'both',
              icon: '⚡',
              title: 'BOTH',
              subtitle: 'Do it all',
              description: 'Maximum flexibility',
            },
          ],
        },
      },
    ]);
    setPredictiveSuggestions([
      { text: "What's the difference?", action: () => handleQuickQuestion("difference") },
      { text: "Is this safe?", action: () => handleQuickQuestion("safety") },
    ]);
    setProgress(25);
  };

  const askForSkills = (role: 'worker' | 'poster' | 'both') => {
    const isWorker = role === 'worker' || role === 'both';
    
    if (isWorker) {
      changeAvatarExpression('thinking');
      addAIMessage("What kind of work can you do?", 'skills', [
        {
          type: 'skill_chips',
          data: {
            categories: [
              { id: 'moving', label: '🚚 Moving', popular: true },
              { id: 'delivery', label: '📦 Delivery', popular: true },
              { id: 'cleaning', label: '🧹 Cleaning', popular: true },
              { id: 'pet_care', label: '🐕 Pet Care', popular: false },
              { id: 'tutoring', label: '📚 Tutoring', popular: false },
              { id: 'home_repair', label: '🔧 Handy', popular: false },
            ],
            trades: [
              { id: 'plumber', label: '🚰 Plumber' },
              { id: 'electrician', label: '⚡ Electrician' },
              { id: 'carpenter', label: '🪚 Carpenter' },
              { id: 'painter', label: '🎨 Painter' },
            ],
          },
        },
      ]);
      setPredictiveSuggestions([
        { text: "I can do deliveries and moving", action: () => setInput("I can do deliveries and moving") },
        { text: "I'm a skilled tradesman", action: () => setInput("I'm a skilled tradesman") },
      ]);
      showContextualBubble('🎯 Pick skills to see earnings!', 3000);
    } else {
      addAIMessage("Great! I'll set you up as a Poster. You can hire workers for any task you need.", 'skills');
      setTimeout(() => askForAvailability(role), 1000);
    }
    setProgress(50);
  };

  const showEarningsPreview = (categories: string[], trades: string[]) => {
    changeAvatarExpression('excited');
    const skills = [...categories, ...trades];
    let minEarnings = 200;
    let maxEarnings = 400;
    
    if (skills.includes('moving')) {
      minEarnings += 100;
      maxEarnings += 200;
    }
    if (trades.length > 0) {
      minEarnings += 200;
      maxEarnings += 400;
    }

    addAIMessage(`Perfect! I heard ${skills.length} skill${skills.length > 1 ? 's' : ''}:`, 'skills', [
      {
        type: 'earnings_preview',
        data: {
          skills,
          potentialEarnings: {
            weekly: { min: minEarnings, max: maxEarnings },
            monthly: { min: minEarnings * 4, max: maxEarnings * 4 },
          },
        },
      },
    ]);

    setTimeout(() => {
      animateEarningsChart();
      playHapticSymphony('success');
    }, 300);

    setTimeout(() => askForAvailability('worker'), 2000);
  };

  const askForAvailability = (role: 'worker' | 'poster' | 'both') => {
    changeAvatarExpression('neutral');
    addAIMessage("When can you hustle?", 'availability', [
      {
        type: 'availability_picker',
        data: {
          quickPicks: [
            { id: 'mornings', label: '⏰ Mornings', hours: 'Mon-Fri 6am-12pm' },
            { id: 'afternoons', label: '🌞 Afternoons', hours: 'Mon-Fri 12pm-6pm' },
            { id: 'evenings', label: '🌙 Evenings', hours: 'Mon-Fri 6pm-12am' },
            { id: 'weekdays', label: '📅 Weekdays', hours: 'Mon-Fri Anytime' },
            { id: 'weekends', label: '🎉 Weekends', hours: 'Sat-Sun Anytime' },
            { id: 'anytime', label: '⚡ Anytime', hours: '24/7 Flexible' },
          ],
        },
      },
    ]);
    setPredictiveSuggestions([
      { text: "I'm flexible", action: () => handleAvailabilitySelect(['anytime']) },
      { text: "Just weekends", action: () => handleAvailabilitySelect(['weekends']) },
    ]);
    setProgress(70);
    showContextualBubble('⏰ More availability = more tasks', 3000);
  };

  const askForLocation = () => {
    changeAvatarExpression('thinking');
    addAIMessage("Where are you based?", 'location', [
      {
        type: 'map_preview',
        data: {
          message: "I'll find tasks near you",
        },
      },
    ]);
    setProgress(85);
    
    setTimeout(() => {
      const mockLocation = {
        lat: 37.7749 + (Math.random() - 0.5) * 0.1,
        lng: -122.4194 + (Math.random() - 0.5) * 0.1,
        address: 'San Francisco, CA',
      };
      setExtractedData(prev => ({ ...prev, location: mockLocation, travelRadius: 5 }));
      
      const nearby = allTasks.filter(t => t.status === 'open').slice(0, 3);
      setNearbyTasks(nearby);
      
      showConfirmation();
    }, 2000);
  };

  const showConfirmation = () => {
    changeAvatarExpression('happy');
    const { name, intent, categories = [], trades = [], availability = [] } = extractedData;
    
    const roleText = intent === 'worker' ? 'find work and earn money' : 
                     intent === 'poster' ? 'hire workers for your projects' : 
                     'both work and hire others';
    
    const skillsText = trades.length > 0 
      ? `skilled trades (${trades.join(', ')})`
      : categories.length > 0
      ? `${categories.join(', ')}`
      : 'various tasks';

    addAIMessage(`Perfect, ${name}! 🎯\n\nLet me confirm what I understood:`, 'confirmation', [
      {
        type: 'confirmation',
        data: {
          name,
          role: roleText,
          skills: skillsText,
          availability: availability.join(', '),
          nearbyTasks: nearbyTasks.length,
        },
      },
    ]);
    
    setPredictiveSuggestions([
      { text: "Looks good!", action: () => confirmAndComplete() },
      { text: "Change something", action: () => askForName() },
    ]);
    setProgress(95);
    setCurrentStep('confirmation');
    showContextualBubble('🎉 Almost there!', 2000);
  };

  const confirmAndComplete = async () => {
    if (!extractedData.name) return;

    changeAvatarExpression('celebrating');
    setShowConfetti(true);
    playHapticSymphony('celebration');
    setProgress(100);

    addAIMessage("🎉 Awesome! Let's get you set up. Creating your account now...", 'complete');

    const role: UserRole = 
      extractedData.intent === 'both' ? 'both' :
      extractedData.intent === 'poster' ? 'poster' : 'worker';

    const mode: UserMode = extractedData.mode || (role === 'poster' ? 'business' : 'everyday');
    const trades = extractedData.trades || [];

    await completeOnboarding(
      extractedData.name,
      role,
      extractedData.location || {
        lat: 37.7749,
        lng: -122.4194,
        address: 'San Francisco, CA',
      },
      extractedData.email,
      undefined,
      mode,
      trades
    );

    setTimeout(() => {
      setCurrentStep('complete');
      showFinalReveal();
    }, 1000);
  };

  const showFinalReveal = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    router.replace('/welcome-tutorial?fromOnboarding=true');
  };

  const addAIMessage = (content: string, step: OnboardingStep, uiComponents?: UIComponent[]) => {
    const newMessage: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      uiComponents,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setCurrentStep(step);
    startMessageAnimation();
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setTypingPrediction('');
    addUserMessage(userMessage);
    playHapticSymphony('success');

    setIsProcessing(true);

    try {
      await processUserInput(userMessage);
    } catch (error) {
      console.error('[AI_ONBOARDING] Error processing message:', error);
      addAIMessage("I'm having trouble processing that. Could you rephrase?", currentStep);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserInput = async (message: string) => {
    changeAvatarExpression('thinking');
    const lowerMessage = message.toLowerCase();

    if (currentStep === 'welcome' || currentStep === 'name') {
      if (!extractedData.name) {
        const nameMatch = message.match(/(?:i'm|i am|my name is|call me)?\s*([a-z]+)/i);
        const name = nameMatch ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : message.split(' ')[0];
        setExtractedData(prev => ({ ...prev, name }));
        await new Promise(resolve => setTimeout(resolve, 500));
        askForRole(name);
      }
    } else if (currentStep === 'skills') {
      const categories: string[] = [];
      if (lowerMessage.includes('clean')) categories.push('Cleaning');
      if (lowerMessage.includes('deliver') || lowerMessage.includes('driver')) categories.push('Delivery');
      if (lowerMessage.includes('move') || lowerMessage.includes('furniture')) categories.push('Moving');
      if (lowerMessage.includes('pet') || lowerMessage.includes('dog')) categories.push('Pet Care');
      if (lowerMessage.includes('tutor') || lowerMessage.includes('teach')) categories.push('Tutoring');
      if (lowerMessage.includes('repair') || lowerMessage.includes('fix')) categories.push('Home Repair');

      const trades: TradeCategory[] = [];
      if (lowerMessage.includes('plumb')) trades.push('plumber' as TradeCategory);
      if (lowerMessage.includes('electric')) trades.push('electrician' as TradeCategory);
      if (lowerMessage.includes('carpent') || lowerMessage.includes('wood')) trades.push('carpenter' as TradeCategory);
      if (lowerMessage.includes('paint')) trades.push('painter' as TradeCategory);

      setExtractedData(prev => ({ ...prev, categories, trades, mode: trades.length > 0 ? 'tradesmen' : 'everyday' }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      showEarningsPreview(categories, trades);
    } else if (currentStep === 'confirmation') {
      if (lowerMessage.includes('yes') || lowerMessage.includes('good') || lowerMessage.includes('correct')) {
        confirmAndComplete();
      }
    }
  };

  const handleRoleSelect = (roleId: string) => {
    playHapticSymphony('success');
    triggerCardFlip();
    const intent = roleId as 'worker' | 'poster' | 'both';
    setExtractedData(prev => ({ ...prev, intent }));
    addUserMessage(`I choose: ${roleId.toUpperCase()}`);
    
    setTimeout(() => {
      askForSkills(intent);
    }, 500);
  };

  const handleSkillSelect = (skillId: string, type: 'category' | 'trade') => {
    playHapticSymphony('success');
    
    setExtractedData(prev => {
      if (type === 'category') {
        const categories = prev.categories || [];
        const exists = categories.includes(skillId);
        return {
          ...prev,
          categories: exists 
            ? categories.filter(c => c !== skillId)
            : [...categories, skillId],
        };
      } else {
        const trades = prev.trades || [];
        const exists = trades.includes(skillId as TradeCategory);
        return {
          ...prev,
          trades: exists 
            ? trades.filter(t => t !== skillId)
            : [...trades, skillId as TradeCategory],
          mode: trades.length > 0 || skillId ? 'tradesmen' : 'everyday',
        };
      }
    });
  };

  const handleAvailabilitySelect = (selected: string[]) => {
    playHapticSymphony('success');
    setExtractedData(prev => ({ ...prev, availability: selected }));
    addUserMessage(`Availability: ${selected.join(', ')}`);
    
    setTimeout(() => {
      addAIMessage(`Great! ${selected.length === 1 && selected[0] === 'anytime' ? "Love the flexibility! 💪" : "Perfect timing! ⏰"}`, 'availability');
      setTimeout(() => askForLocation(), 1000);
    }, 500);
  };

  const handleQuickQuestion = (type: string) => {
    playHapticSymphony('success');
    if (type === 'difference') {
      setShowHelpModal(true);
    } else if (type === 'safety') {
      setShowHelpModal(true);
    }
  };

  const startVoiceRecording = async () => {
    if (Platform.OS === 'web') {
      addAIMessage("Voice input is not available on web. Please type your message.", currentStep);
      return;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        addAIMessage("I need microphone permission to use voice input.", currentStep);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      playHapticSymphony('success');

      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } catch (error) {
      console.error('[VOICE] Failed to start recording:', error);
    }
  };

  const stopVoiceRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      setIsRecording(false);
      setRecording(null);
      playHapticSymphony('success');
      waveformAnim.setValue(0);

      addAIMessage("Processing your voice input...", currentStep);
      
      setTimeout(() => {
        addAIMessage("Voice input processed! (Demo mode - please type instead)", currentStep);
      }, 1500);
    } catch (error) {
      console.error('[VOICE] Failed to stop recording:', error);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const isLastMessage = index === messages.length - 1;

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: isLastMessage ? slideAnim : 0 }],
          },
        ]}
      >
        {!isUser && (
          <Animated.View 
            style={[
              styles.avatarContainer,
              { 
                transform: [
                  { scale: Animated.multiply(avatarPulse, Animated.multiply(breatheAnim, avatarScale)) },
                  { 
                    rotate: avatarRotate.interpolate({
                      inputRange: [-2, 2],
                      outputRange: ['-10deg', '10deg'],
                    })
                  }
                ] 
              }
            ]}
          >
            <LinearGradient
              colors={
                avatarExpression === 'celebrating' 
                  ? [premiumColors.neonAmber, premiumColors.neonMagenta]
                  : avatarExpression === 'excited'
                  ? [premiumColors.neonGreen, premiumColors.neonCyan]
                  : [premiumColors.neonCyan, premiumColors.neonMagenta]
              }
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Brain size={20} color={Colors.background} />
            </LinearGradient>
            
            {/* Hologram scanline effect */}
            <Animated.View
              style={[
                styles.hologramScanline,
                {
                  transform: [{
                    translateY: hologramAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 36],
                    })
                  }]
                }
              ]}
            />
          </Animated.View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <BlurView intensity={isUser ? 30 : 40} tint="dark" style={styles.messageBlur}>
            <LinearGradient
              colors={
                isUser
                  ? [premiumColors.neonCyan + '40', premiumColors.neonBlue + '20']
                  : [premiumColors.glassDark + '80', premiumColors.glassDark + '60']
              }
              style={styles.messageGradient}
            >
              <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                {message.content}
              </Text>
            </LinearGradient>
          </BlurView>
        </View>

        {!isUser && message.uiComponents && (
          <View style={styles.uiComponentsContainer}>
            {message.uiComponents.map((component, idx) => renderUIComponent(component, idx))}
          </View>
        )}
      </Animated.View>
    );
  };

  const renderUIComponent = (component: UIComponent, index: number) => {
    switch (component.type) {
      case 'role_cards':
        return (
          <View key={index} style={styles.roleCardsContainer}>
            {component.data.roles.map((role: any, roleIndex: number) => {
              const rotateY = cardFlipAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              });
              
              return (
                <Animated.View
                  key={role.id}
                  style={{
                    transform: [{ perspective: 1000 }, { rotateY }],
                  }}
                >
                  <TouchableOpacity
                    style={styles.roleCard}
                    onPress={() => handleRoleSelect(role.id)}
                    activeOpacity={0.8}
                  >
                    <BlurView intensity={40} tint="dark" style={styles.roleCardContent}>
                      <LinearGradient
                        colors={[
                          premiumColors.glassDark + '60',
                          premiumColors.glassDark + '40',
                        ]}
                        style={styles.roleCardGradient}
                      >
                        <Text style={styles.roleCardIcon}>{role.icon}</Text>
                        <Text style={styles.roleCardTitle}>{role.title}</Text>
                        <Text style={styles.roleCardSubtitle}>{role.subtitle}</Text>
                        <Text style={styles.roleCardDescription}>{role.description}</Text>
                        <View style={styles.roleCardButton}>
                          <Text style={styles.roleCardButtonText}>SELECT</Text>
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        );

      case 'skill_chips':
        return (
          <View key={index} style={styles.skillChipsContainer}>
            <Text style={styles.skillChipsLabel}>Popular near you:</Text>
            <View style={styles.chipsList}>
              {component.data.categories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    (extractedData.categories || []).includes(cat.id) && styles.chipSelected,
                  ]}
                  onPress={() => handleSkillSelect(cat.id, 'category')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.chipText,
                    (extractedData.categories || []).includes(cat.id) && styles.chipTextSelected,
                  ]}>
                    {cat.label}
                  </Text>
                  {cat.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>HOT</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {component.data.trades.length > 0 && (
              <>
                <Text style={[styles.skillChipsLabel, { marginTop: spacing.lg }]}>Skilled Trades:</Text>
                <View style={styles.chipsList}>
                  {component.data.trades.map((trade: any) => (
                    <TouchableOpacity
                      key={trade.id}
                      style={[
                        styles.chip,
                        styles.tradeChip,
                        (extractedData.trades || []).includes(trade.id) && styles.chipSelected,
                      ]}
                      onPress={() => handleSkillSelect(trade.id, 'trade')}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.chipText,
                        (extractedData.trades || []).includes(trade.id) && styles.chipTextSelected,
                      ]}>
                        {trade.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {(extractedData.categories?.length || 0) + (extractedData.trades?.length || 0) > 0 && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => showEarningsPreview(extractedData.categories || [], extractedData.trades || [])}
              >
                <LinearGradient
                  colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>LOOKS GOOD</Text>
                  <ArrowRight size={18} color={Colors.background} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'earnings_preview':
        const { skills, potentialEarnings } = component.data;
        const weeklyEarnings = [
          { label: 'Week 1', value: potentialEarnings.weekly.min },
          { label: 'Week 2', value: potentialEarnings.weekly.min * 1.2 },
          { label: 'Week 3', value: potentialEarnings.weekly.min * 1.5 },
          { label: 'Week 4', value: potentialEarnings.weekly.max },
        ];

        return (
          <View key={index} style={styles.earningsPreview}>
            <BlurView intensity={50} tint="dark" style={styles.earningsBlur}>
              <View style={styles.earningsContent}>
                <View style={styles.skillsList}>
                  {skills.map((skill: string, idx: number) => (
                    <View key={idx} style={styles.skillTag}>
                      <Check size={14} color={premiumColors.neonGreen} />
                      <Text style={styles.skillTagText}>{skill}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.earningsDivider} />

                <View style={styles.earningsSection}>
                  <TrendingUp size={20} color={premiumColors.neonGreen} />
                  <Text style={styles.earningsTitle}>Your Growth Potential:</Text>
                </View>

                {/* Animated chart */}
                <View style={styles.earningsChart}>
                  {weeklyEarnings.map((week, idx) => (
                    <View key={idx} style={styles.chartColumn}>
                      <Animated.View
                        style={[
                          styles.chartBar,
                          {
                            height: chartBarAnims[idx].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, (week.value / potentialEarnings.weekly.max) * 100],
                            }),
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={[premiumColors.neonGreen, premiumColors.neonCyan]}
                          style={StyleSheet.absoluteFill}
                        />
                      </Animated.View>
                      <Text style={styles.chartLabel}>{week.label}</Text>
                      <Text style={styles.chartValue}>${week.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.earningsRow}>
                  <Text style={styles.earningsLabel}>Monthly Potential:</Text>
                  <Text style={styles.earningsValue}>
                    ${potentialEarnings.monthly.min.toLocaleString()}-${potentialEarnings.monthly.max.toLocaleString()}
                  </Text>
                </View>

                <Text style={styles.earningsNote}>
                  📈 As you level up and build trust!
                </Text>
              </View>
            </BlurView>
          </View>
        );

      case 'availability_picker':
        return (
          <View key={index} style={styles.availabilityPicker}>
            {component.data.quickPicks.map((pick: any) => (
              <TouchableOpacity
                key={pick.id}
                style={styles.availabilityCard}
                onPress={() => handleAvailabilitySelect([pick.id])}
                activeOpacity={0.8}
              >
                <BlurView intensity={40} tint="dark" style={styles.availabilityBlur}>
                  <Text style={styles.availabilityLabel}>{pick.label}</Text>
                  <Text style={styles.availabilityHours}>{pick.hours}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'map_preview':
        return (
          <View key={index} style={styles.mapPreview}>
            <BlurView intensity={50} tint="dark" style={styles.mapBlur}>
              <MapPin size={32} color={premiumColors.neonCyan} />
              <Text style={styles.mapText}>Detecting your location...</Text>
              <Animated.View 
                style={[
                  styles.mapLoader,
                  {
                    transform: [{
                      rotate: hologramAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}
              >
                <Loader size={20} color={premiumColors.neonCyan} />
              </Animated.View>
            </BlurView>
          </View>
        );

      case 'confirmation':
        const { name, role, skills: confirmSkills, availability, nearbyTasks: tasksCount } = component.data;
        return (
          <View key={index} style={styles.confirmationCard}>
            <BlurView intensity={60} tint="dark" style={styles.confirmationBlur}>
              <View style={styles.confirmationRow}>
                <Check size={20} color={premiumColors.neonGreen} />
                <Text style={styles.confirmationLabel}>You want to {role}</Text>
              </View>
              <View style={styles.confirmationRow}>
                <Check size={20} color={premiumColors.neonGreen} />
                <Text style={styles.confirmationLabel}>Interested in {confirmSkills}</Text>
              </View>
              <View style={styles.confirmationRow}>
                <Check size={20} color={premiumColors.neonGreen} />
                <Text style={styles.confirmationLabel}>Available {availability}</Text>
              </View>

              {tasksCount > 0 && (
                <View style={styles.confirmationHighlight}>
                  <Star size={18} color={premiumColors.neonAmber} fill={premiumColors.neonAmber} />
                  <Text style={styles.confirmationHighlightText}>
                    {tasksCount} perfect tasks waiting for you!
                  </Text>
                </View>
              )}
            </BlurView>
          </View>
        );

      default:
        return null;
    }
  };

  const renderWaveformVisualizer = () => {
    if (!isRecording) return null;

    return (
      <View style={styles.waveformContainer}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveformBar,
              {
                height: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 40],
                }),
                opacity: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderHelpModal = () => (
    <Modal
      visible={showHelpModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} tint="dark" style={styles.modalBlur}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowHelpModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Quick Guide 📚</Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>💪 Hustler</Text>
              <Text style={styles.modalText}>
                Find gigs, complete tasks, earn money. Perfect if you want to make extra cash!
              </Text>
              <Text style={styles.modalExample}>
                Example: Deliver groceries, $15-50/hr
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>📋 Poster</Text>
              <Text style={styles.modalText}>
                Post tasks, hire workers. Get things done without lifting a finger!
              </Text>
              <Text style={styles.modalExample}>
                Example: &quot;Clean my garage&quot; → $50
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>⚡ Both</Text>
              <Text style={styles.modalText}>
                Maximum flexibility! Work when you want, hire when you need.
              </Text>
            </View>

            <View style={styles.modalSafety}>
              <Text style={styles.modalSafetyTitle}>🛡️ Safety First</Text>
              <View style={styles.safetyFeatures}>
                <Text style={styles.safetyFeature}>✓ All users ID verified</Text>
                <Text style={styles.safetyFeature}>✓ Real-time GPS tracking</Text>
                <Text style={styles.safetyFeature}>✓ 24/7 support team</Text>
                <Text style={styles.safetyFeature}>✓ Payment in escrow</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowHelpModal(false)}
            >
              <LinearGradient
                colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack, '#1A1A2E']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}

      {/* Firework particles */}
      {showFireworks && fireworkParticles.map((particle) => (
        <Animated.View
          key={`firework-${particle.id}`}
          style={[
            styles.fireworkParticle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}

      {/* Contextual bubbles */}
      {contextualBubbles.map((bubble) => (
        <Animated.View
          key={bubble.id}
          style={[
            styles.contextualBubble,
            {
              left: bubble.x,
              top: bubble.y,
              opacity: bubbleAnim,
              transform: [{
                translateY: bubbleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.bubbleBlur}>
            <Text style={styles.bubbleText}>{bubble.text}</Text>
          </BlurView>
        </Animated.View>
      ))}

      {showConfetti && <Confetti />}
      {renderHelpModal()}

      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Sparkles size={24} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
            <Text style={styles.headerTitle}>HustleXP AI Coach</Text>
          </View>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowHelpModal(true)}
          >
            <HelpCircle size={24} color={premiumColors.glassWhiteStrong} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        {/* Gesture hints */}
        <View style={styles.gestureHints}>
          <View style={styles.gestureHint}>
            <ChevronLeft size={16} color={premiumColors.glassWhiteStrong} />
            <Text style={styles.gestureHintText}>Swipe</Text>
            <ChevronRight size={16} color={premiumColors.glassWhiteStrong} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          
          {isProcessing && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <Loader size={16} color={premiumColors.neonCyan} />
                <Text style={styles.typingText}>AI is thinking...</Text>
              </View>
            </View>
          )}

          {predictiveSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>💡 Quick options:</Text>
              {predictiveSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={suggestion.action}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{suggestion.text}</Text>
                  <ArrowRight size={16} color={premiumColors.neonCyan} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.md }]}>
          {renderWaveformVisualizer()}
          
          <BlurView intensity={60} tint="dark" style={styles.inputBlur}>
            <View style={styles.inputWrapper}>
              <MessageCircle size={20} color={premiumColors.glassWhiteStrong} />
              <View style={styles.inputWithPrediction}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor={premiumColors.glassWhiteStrong}
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  multiline
                  maxLength={500}
                  editable={!isProcessing}
                />
                {typingPrediction && (
                  <Text style={styles.typingPrediction}>
                    {input}
                    <Text style={styles.typingPredictionSuggestion}>{typingPrediction}</Text>
                  </Text>
                )}
              </View>
              
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={styles.voiceButton}
                  onPress={isRecording ? stopVoiceRecording : startVoiceRecording}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.voiceButtonInner,
                      isRecording && {
                        opacity: waveformAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ]}
                  >
                    <Mic size={18} color={isRecording ? premiumColors.neonMagenta : premiumColors.glassWhiteStrong} />
                  </Animated.View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.sendButton, (!input.trim() || isProcessing) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!input.trim() || isProcessing}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    input.trim() && !isProcessing
                      ? [premiumColors.neonCyan, premiumColors.neonBlue]
                      : [premiumColors.glassWhite, premiumColors.glassWhite]
                  }
                  style={styles.sendButtonGradient}
                >
                  <Send size={18} color={input.trim() && !isProcessing ? Colors.background : premiumColors.glassWhiteStrong} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: premiumColors.neonCyan,
  },
  fireworkParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: premiumColors.neonAmber,
  },
  contextualBubble: {
    position: 'absolute',
    zIndex: 1000,
  },
  bubbleBlur: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan,
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginLeft: spacing.sm,
  },
  helpButton: {
    padding: spacing.xs,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  gestureHints: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  gestureHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gestureHintText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  messageContainer: {
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 15,
    shadowOpacity: 0.8,
  },
  hologramScanline: {
    position: 'absolute',
    width: 36,
    height: 2,
    backgroundColor: premiumColors.neonCyan,
    opacity: 0.5,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  messageBlur: {
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  messageGradient: {
    padding: spacing.md,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.text,
  },
  uiComponentsContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  roleCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  roleCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md * 2) / 3 - spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  roleCardContent: {
    borderRadius: borderRadius.xl,
  },
  roleCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  roleCardIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  roleCardSubtitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  roleCardDescription: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  roleCardButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: premiumColors.neonCyan + '30',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan,
  },
  roleCardButtonText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  skillChipsContainer: {
    width: '100%',
  },
  skillChipsLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.sm,
  },
  chipsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: premiumColors.glassDark + '80',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: premiumColors.neonCyan + '30',
    borderColor: premiumColors.neonCyan,
  },
  tradeChip: {
    backgroundColor: premiumColors.neonMagenta + '20',
    borderColor: premiumColors.neonMagenta + '60',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chipTextSelected: {
    color: premiumColors.neonCyan,
  },
  popularBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    backgroundColor: premiumColors.neonMagenta,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  confirmButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  earningsPreview: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonGreen + '40',
  },
  earningsBlur: {
    borderRadius: borderRadius.xl,
  },
  earningsContent: {
    padding: spacing.lg,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: premiumColors.neonGreen + '20',
    borderRadius: borderRadius.md,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.neonGreen,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: premiumColors.glassWhite,
    marginVertical: spacing.md,
  },
  earningsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  earningsTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  earningsChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: spacing.lg,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '70%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.xs,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  earningsNote: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  availabilityPicker: {
    width: '100%',
    gap: spacing.sm,
  },
  availabilityCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  availabilityBlur: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  availabilityLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  availabilityHours: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
  },
  mapPreview: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '40',
  },
  mapBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  mapText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  mapLoader: {
    marginTop: spacing.sm,
  },
  confirmationCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonGreen + '40',
  },
  confirmationBlur: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  confirmationHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: premiumColors.neonAmber + '20',
    borderRadius: borderRadius.lg,
  },
  confirmationHighlightText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.xl,
    marginLeft: 44,
  },
  typingText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    fontStyle: 'italic' as const,
    marginLeft: spacing.sm,
  },
  suggestionsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.sm,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: premiumColors.glassDark + '60',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    marginBottom: spacing.sm,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: premiumColors.deepBlack + 'F0',
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  waveformBar: {
    width: 3,
    backgroundColor: premiumColors.neonMagenta,
    borderRadius: 2,
  },
  inputBlur: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWithPrediction: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  typingPrediction: {
    position: 'absolute',
    fontSize: 15,
    fontWeight: '500' as const,
    color: 'transparent',
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    pointerEvents: 'none',
  },
  typingPredictionSuggestion: {
    color: premiumColors.glassWhiteStrong,
    opacity: 0.5,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  voiceButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  modalContent: {
    padding: spacing.xl,
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
    padding: spacing.sm,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.sm,
  },
  modalText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  modalExample: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    fontStyle: 'italic' as const,
  },
  modalSafety: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: premiumColors.neonGreen + '20',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.neonGreen,
  },
  modalSafetyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
    marginBottom: spacing.md,
  },
  safetyFeatures: {
    gap: spacing.sm,
  },
  safetyFeature: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  modalButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.background,
  },
});
