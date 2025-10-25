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
  Star, MapPin, ArrowRight, Zap,
  X, HelpCircle, TrendingUp, ChevronLeft, ChevronRight,
  Rocket
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

import Colors from '@/constants/colors';
import { premiumColors, spacing, borderRadius, neonGlow } from '@/constants/designTokens';
import Confetti from '@/components/Confetti';
import RateLimitToast from '@/components/RateLimitToast';
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
  gamertag?: string;
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
  color: string;
}

interface ContextualBubble {
  id: string;
  text: string;
  icon: string;
  x: number;
  y: number;
  visible: boolean;
}

interface RoleData {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}

type OnboardingStep = 'welcome' | 'name' | 'role' | 'skills' | 'availability' | 'location' | 'confirmation' | 'complete';
type AvatarExpression = 'neutral' | 'happy' | 'thinking' | 'excited' | 'celebrating';

const PARTICLE_COUNT = 80;
const FIREWORK_PARTICLE_COUNT = 150;

// 🎯 3D Role Card Component with Maximum Polish
function RoleCard3D({ role, onSelect, flipAnim, index }: { role: RoleData; onSelect: () => void; flipAnim: Animated.Value; index: number }) {
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const scale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Continuous float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000 + index * 300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000 + index * 300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
    if (Platform.OS !== 'web') {
      triggerHaptic('light');
    }
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 40,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  
  return (
    <Animated.View
      style={[
        styles.roleCardWrapper,
        {
          transform: [
            { perspective: 1200 },
            { rotateY },
            { scale },
            { translateY },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.roleCard}
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* 3D depth layers */}
        <Animated.View 
          style={[
            styles.card3DLayer1,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
              backgroundColor: role.color,
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.card3DLayer2,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4],
              }),
              backgroundColor: role.color,
            }
          ]} 
        />
        
        <BlurView intensity={50} tint="dark" style={styles.roleCardContent}>
          <LinearGradient
            colors={[
              premiumColors.glassDark + '80',
              premiumColors.glassDark + '40',
            ]}
            style={styles.roleCardGradient}
          >
            {/* Animated icon with glow */}
            <Animated.View
              style={[
                styles.roleCardIconContainer,
                {
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.roleCardIcon}>{role.icon}</Text>
              <Animated.View 
                style={[
                  styles.iconGlow,
                  {
                    opacity: glowAnim,
                    backgroundColor: role.color,
                  }
                ]}
              />
            </Animated.View>
            
            <Text style={styles.roleCardTitle}>{role.title}</Text>
            <Text style={styles.roleCardSubtitle}>{role.subtitle}</Text>
            <Text style={styles.roleCardDescription}>{role.description}</Text>
            
            <View style={styles.roleCardButton}>
              <LinearGradient
                colors={[role.color + '60', role.color + '40']}
                style={styles.roleCardButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.roleCardButtonText, { color: role.color }]}>SELECT</Text>
                <Zap size={12} color={role.color} fill={role.color} />
              </LinearGradient>
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

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
  const [showRateLimitToast, setShowRateLimitToast] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState(60);

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
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Gesture for swiping between steps
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          handleSwipeBack();
        } else if (gestureState.dx < -50) {
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
      } else if (lowerText.length > 2) {
        setTypingPrediction('');
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

  const showContextualBubble = (text: string, icon: string, delay: number = 2000) => {
    const bubble: ContextualBubble = {
      id: `bubble-${Date.now()}`,
      text,
      icon,
      x: Math.random() * (SCREEN_WIDTH - 220) + 20,
      y: SCREEN_HEIGHT * 0.2 + Math.random() * 100,
      visible: true,
    };
    
    setContextualBubbles(prev => [...prev, bubble]);
    
    Animated.sequence([
      Animated.spring(bubbleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
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
    const colors = [
      premiumColors.neonCyan,
      premiumColors.neonMagenta,
      premiumColors.neonAmber,
      premiumColors.neonGreen,
      premiumColors.neonViolet,
    ];
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      newParticles.push({
        id: i,
        x: new Animated.Value(Math.random() * SCREEN_WIDTH),
        y: new Animated.Value(Math.random() * SCREEN_HEIGHT),
        scale: new Animated.Value(Math.random() * 0.5 + 0.5),
        opacity: new Animated.Value(Math.random() * 0.4 + 0.2),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(newParticles);
    animateParticles(newParticles);
  };

  const animateParticles = (particleList: Particle[]) => {
    particleList.forEach((particle, index) => {
      const randomDelay = Math.random() * 3000;
      const randomDuration = 10000 + Math.random() * 8000;

      Animated.loop(
        Animated.sequence([
          Animated.delay(randomDelay),
          Animated.parallel([
            Animated.timing(particle.x, {
              toValue: Math.random() * SCREEN_WIDTH,
              duration: randomDuration,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: Math.random() * SCREEN_HEIGHT,
              duration: randomDuration,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: Math.random() * 0.6 + 0.3,
                duration: randomDuration / 2,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: Math.random() * 0.3 + 0.1,
                duration: randomDuration / 2,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(particle.scale, {
                toValue: Math.random() * 0.8 + 0.6,
                duration: randomDuration / 2,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: Math.random() * 0.5 + 0.3,
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
    const colors = [
      premiumColors.neonAmber,
      premiumColors.neonMagenta,
      premiumColors.neonCyan,
      premiumColors.neonGreen,
    ];
    
    const newFireworkParticles: Particle[] = [];
    
    for (let i = 0; i < FIREWORK_PARTICLE_COUNT; i++) {
      newFireworkParticles.push({
        id: i,
        x: new Animated.Value(SCREEN_WIDTH / 2),
        y: new Animated.Value(SCREEN_HEIGHT / 2),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setFireworkParticles(newFireworkParticles);
    
    newFireworkParticles.forEach((particle, index) => {
      const angle = (Math.PI * 2 * index) / FIREWORK_PARTICLE_COUNT;
      const velocity = Math.random() * 250 + 200;
      const targetX = SCREEN_WIDTH / 2 + Math.cos(angle) * velocity;
      const targetY = SCREEN_HEIGHT / 2 + Math.sin(angle) * velocity;
      
      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: targetX,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: targetY,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    playHapticSymphony('celebration');

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
        setTimeout(() => triggerHaptic('success'), 700);
        break;
    }
  };

  const changeAvatarExpression = (expression: AvatarExpression) => {
    setAvatarExpression(expression);
    
    switch (expression) {
      case 'happy':
        Animated.spring(avatarScale, {
          toValue: 1.3,
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
            toValue: 1.4,
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
        
        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
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
        Animated.delay(index * 250),
        Animated.spring(anim, {
          toValue: 1,
          tension: 30,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleSwipeBack = () => {
    if (currentStep === 'name' || currentStep === 'welcome') return;
    
    triggerHaptic('light');
    showContextualBubble('Going back a step', '👈', 1500);
  };

  const handleSwipeForward = () => {
    if (!canSwipeForward()) return;
    
    triggerHaptic('light');
    showContextualBubble('Moving forward!', '✨', 1500);
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
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
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
        duration: 400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardFlipAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.quad),
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
    showContextualBubble('You can use voice or text!', '🎙️', 4000);
    askForName();
  };

  const askForName = () => {
    changeAvatarExpression('neutral');
    addAIMessage("What's your real name? (We'll generate a cool gamertag for you!)", 'name');
    setPredictiveSuggestions([
      { text: "Why do you need my real name?", action: () => handleQuickQuestion("name_reason") },
    ]);
    setProgress(10);
    showContextualBubble('Your name builds trust with clients', '✨', 4000);
  };

  const generateGamertag = (name: string): string => {
    const adjectives = [
      'Shadow', 'Neon', 'Cyber', 'Quantum', 'Turbo', 'Elite', 'Alpha', 'Omega',
      'Phoenix', 'Storm', 'Blaze', 'Thunder', 'Frost', 'Viper', 'Steel', 'Titan',
      'Sonic', 'Cosmic', 'Lunar', 'Solar', 'Rapid', 'Prime', 'Ultra', 'Mega',
    ];
    const nouns = [
      'Hustler', 'Grinder', 'Warrior', 'Legend', 'Champion', 'Master', 'Ninja',
      'Phantom', 'Ghost', 'Hunter', 'Striker', 'Wolf', 'Lion', 'Eagle', 'Hawk',
      'Dragon', 'Vortex', 'Blade', 'Force', 'Spirit', 'Maverick', 'Rogue', 'Ace',
    ];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 99) + 1;
    
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  const askForRole = (name: string) => {
    const gamertag = generateGamertag(name);
    setExtractedData(prev => ({ ...prev, gamertag }));
    changeAvatarExpression('happy');
    
    addAIMessage(
      `${name} - I like it! ✨\n\n🎮 Your gamertag: ${gamertag}\n\nNow, what brings you to HustleXP?`, 
      'role', 
      [
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
                color: premiumColors.neonCyan,
              },
              {
                id: 'poster',
                icon: '📋',
                title: 'POSTER',
                subtitle: 'Get tasks done for you',
                description: 'Hire workers, post jobs, get help',
                color: premiumColors.neonMagenta,
              },
              {
                id: 'both',
                icon: '⚡',
                title: 'BOTH',
                subtitle: 'Do it all',
                description: 'Maximum flexibility',
                color: premiumColors.neonAmber,
              },
            ],
          },
        },
      ]
    );
    setPredictiveSuggestions([
      { text: "What's the difference?", action: () => handleQuickQuestion("difference") },
      { text: "Is this safe?", action: () => handleQuickQuestion("safety") },
    ]);
    setProgress(25);
    showContextualBubble('Most users start as Hustlers', '💡', 3000);
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
      showContextualBubble('Pick skills to see earnings!', '🎯', 3000);
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
      showContextualBubble('Nice! You could earn great money!', '💰', 3000);
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
    showContextualBubble('More availability = more tasks', '⏰', 3000);
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
    showContextualBubble('Almost there!', '🎉', 2000);
  };

  const handleRateLimitError = (error: any) => {
    const errorMessage = error?.message || String(error);
    const retryMatch = errorMessage.match(/(\d+)\s*second/i);
    const retryAfter = retryMatch ? parseInt(retryMatch[1]) : 60;
    
    setRateLimitRetryAfter(retryAfter);
    setShowRateLimitToast(true);
    
    // Auto hide after the retry period
    setTimeout(() => {
      setShowRateLimitToast(false);
    }, (retryAfter + 2) * 1000);
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
        const nameMatch = message.match(/(?:i'm|i am|my name is|call me)?\s*([a-zA-Z]+)/i);
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
    setShowHelpModal(true);
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
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 400,
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
                  },
                  { translateX: shakeAnim }
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
            
            <Animated.View
              style={[
                styles.avatarGlow,
                {
                  transform: [{
                    translateY: hologramAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 40],
                    })
                  }]
                }
              ]}
            />
          </Animated.View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <BlurView intensity={isUser ? 30 : 50} tint="dark" style={styles.messageBlur}>
            <LinearGradient
              colors={
                isUser
                  ? [premiumColors.neonCyan + '50', premiumColors.neonBlue + '30']
                  : [premiumColors.glassDark + '90', premiumColors.glassDark + '70']
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
            {component.data.roles.map((role: RoleData, roleIndex: number) => (
              <RoleCard3D
                key={role.id}
                role={role}
                onSelect={() => handleRoleSelect(role.id)}
                flipAnim={cardFlipAnim}
                index={roleIndex}
              />
            ))}
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
            <BlurView intensity={60} tint="dark" style={styles.earningsBlur}>
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
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((barIndex) => (
          <Animated.View
            key={barIndex}
            style={[
              styles.waveformBar,
              {
                height: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 45 - Math.abs(barIndex - 5.5) * 3],
                }),
                opacity: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
                backgroundColor: barIndex % 2 === 0 ? premiumColors.neonMagenta : premiumColors.neonCyan,
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
        <BlurView intensity={90} tint="dark" style={styles.modalBlur}>
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
        colors={[premiumColors.deepBlack, premiumColors.richBlack, '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Enhanced floating particles with colors */}
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
              backgroundColor: particle.color,
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
              backgroundColor: particle.color,
            },
          ]}
        />
      ))}

      {/* Enhanced contextual bubbles */}
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
                  outputRange: [30, 0],
                }),
              }, {
                scale: bubbleAnim,
              }]
            },
          ]}
        >
          <BlurView intensity={50} tint="dark" style={styles.bubbleBlur}>
            <Text style={styles.bubbleIcon}>{bubble.icon}</Text>
            <Text style={styles.bubbleText}>{bubble.text}</Text>
          </BlurView>
        </Animated.View>
      ))}

      {showConfetti && <Confetti />}
      {renderHelpModal()}
      
      <RateLimitToast
        visible={showRateLimitToast}
        retryAfter={rateLimitRetryAfter}
        onDismiss={() => setShowRateLimitToast(false)}
      />

      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Sparkles size={24} color={premiumColors.neonCyan} fill={premiumColors.neonCyan} />
            <Text style={styles.headerTitle}>HustleXP AI Coach</Text>
            <Animated.View style={{
              transform: [{
                rotate: hologramAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }}>
              <Rocket size={20} color={premiumColors.neonAmber} />
            </Animated.View>
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
              colors={[premiumColors.neonCyan, premiumColors.neonBlue, premiumColors.neonMagenta, premiumColors.neonAmber]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        <View style={styles.gestureHints}>
          <View style={styles.gestureHint}>
            <ChevronLeft size={16} color={premiumColors.glassWhiteStrong} />
            <Text style={styles.gestureHintText}>Swipe to navigate</Text>
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
                <Animated.View style={{
                  transform: [{
                    rotate: hologramAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }}>
                  <Loader size={16} color={premiumColors.neonCyan} />
                </Animated.View>
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
          
          <BlurView intensity={70} tint="dark" style={styles.inputBlur}>
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
                  style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
                  onPress={isRecording ? stopVoiceRecording : startVoiceRecording}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.voiceButtonInner,
                      isRecording && {
                        opacity: waveformAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.6, 1],
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
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fireworkParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  contextualBubble: {
    position: 'absolute',
    zIndex: 1000,
  },
  bubbleBlur: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '60',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...neonGlow.cyan,
  },
  bubbleIcon: {
    fontSize: 16,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '700' as const,
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
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  helpButton: {
    padding: spacing.xs,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: premiumColors.glassWhite,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...neonGlow.subtle,
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  gestureHints: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  gestureHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gestureHintText: {
    fontSize: 11,
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
    marginBottom: spacing.xl,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...neonGlow.cyan,
    shadowRadius: 20,
    shadowOpacity: 1,
  },
  avatarGlow: {
    position: 'absolute',
    width: 40,
    height: 3,
    backgroundColor: premiumColors.neonCyan,
    opacity: 0.7,
    borderRadius: 2,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  messageBlur: {
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhite,
  },
  messageGradient: {
    padding: spacing.lg,
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
    marginTop: spacing.lg,
  },
  
  // 🎯 Enhanced 3D Role Cards
  roleCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  roleCardWrapper: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - spacing.xl * 2 - spacing.lg * 2) / 3 - spacing.lg,
  },
  roleCard: {
    borderRadius: borderRadius.xxl,
    overflow: 'visible',
  },
  card3DLayer1: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: borderRadius.xxl,
    zIndex: -1,
  },
  card3DLayer2: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    borderRadius: borderRadius.xxl,
    zIndex: -2,
  },
  roleCardContent: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  roleCardGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  roleCardIconContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  roleCardIcon: {
    fontSize: 40,
  },
  iconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -10,
    left: -10,
    opacity: 0.3,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  roleCardSubtitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  roleCardDescription: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  roleCardButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  roleCardButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  roleCardButtonText: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  
  skillChipsContainer: {
    width: '100%',
  },
  skillChipsLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.md,
  },
  chipsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: premiumColors.glassDark + '90',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: premiumColors.neonCyan + '40',
    borderColor: premiumColors.neonCyan,
    ...neonGlow.cyan,
  },
  tradeChip: {
    backgroundColor: premiumColors.neonMagenta + '20',
    borderColor: premiumColors.neonMagenta + '60',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  chipTextSelected: {
    color: premiumColors.neonCyan,
  },
  popularBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: premiumColors.neonMagenta,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  confirmButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...neonGlow.cyan,
  },
  confirmButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  earningsPreview: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonGreen + '60',
    ...neonGlow.green,
  },
  earningsBlur: {
    borderRadius: borderRadius.xxl,
  },
  earningsContent: {
    padding: spacing.xl,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: premiumColors.neonGreen + '30',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen,
  },
  skillTagText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: premiumColors.glassWhiteStrong,
    marginVertical: spacing.lg,
  },
  earningsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  earningsChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
    marginBottom: spacing.xl,
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
    marginBottom: spacing.sm,
    ...neonGlow.green,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.xs,
  },
  chartValue: {
    fontSize: 12,
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
    fontSize: 15,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: premiumColors.neonGreen,
  },
  earningsNote: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  availabilityPicker: {
    width: '100%',
    gap: spacing.md,
  },
  availabilityCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
  },
  availabilityBlur: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  availabilityHours: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
  },
  mapPreview: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan + '60',
    ...neonGlow.cyan,
  },
  mapBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  mapText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  mapLoader: {
    marginTop: spacing.sm,
  },
  confirmationCard: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonGreen + '60',
    ...neonGlow.green,
  },
  confirmationBlur: {
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  confirmationLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  confirmationHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: premiumColors.neonAmber + '30',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
  },
  confirmationHighlightText: {
    fontSize: 14,
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
    backgroundColor: premiumColors.glassDark + '90',
    borderRadius: borderRadius.xl,
    marginLeft: 48,
    gap: spacing.sm,
  },
  typingText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    fontStyle: 'italic' as const,
  },
  suggestionsContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  suggestionsLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: premiumColors.glassWhiteStrong,
    marginBottom: spacing.md,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: premiumColors.glassDark + '70',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    marginBottom: spacing.sm,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: premiumColors.deepBlack + 'F5',
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhiteStrong,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  inputBlur: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.glassWhiteStrong,
    ...neonGlow.subtle,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputWithPrediction: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
    maxHeight: 120,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  typingPrediction: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'transparent',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    pointerEvents: 'none',
  },
  typingPredictionSuggestion: {
    color: premiumColors.glassWhiteStrong,
    opacity: 0.6,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: premiumColors.glassDark,
  },
  voiceButtonRecording: {
    backgroundColor: premiumColors.neonMagenta + '30',
    ...neonGlow.magenta,
  },
  voiceButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...neonGlow.cyan,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: premiumColors.neonCyan,
  },
  modalContent: {
    padding: spacing.xxl,
  },
  modalClose: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.md,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.full,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: spacing.xl,
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: spacing.md,
  },
  modalText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  modalExample: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: premiumColors.glassWhiteStrong,
    fontStyle: 'italic' as const,
  },
  modalSafety: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    backgroundColor: premiumColors.neonGreen + '20',
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: premiumColors.neonGreen,
  },
  modalSafetyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: premiumColors.neonGreen,
    marginBottom: spacing.lg,
  },
  safetyFeatures: {
    gap: spacing.md,
  },
  safetyFeature: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  modalButton: {
    marginTop: spacing.xxl,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...neonGlow.cyan,
  },
  modalButtonGradient: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.background,
  },
});
