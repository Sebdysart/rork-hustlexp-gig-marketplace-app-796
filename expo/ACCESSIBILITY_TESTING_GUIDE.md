# 🧪 Accessibility Testing Guide

## Quick Verification Checklist

### ✅ Screen Reader Testing

#### iOS VoiceOver
```bash
Settings → Accessibility → VoiceOver → ON
```

**Test Flow:**
1. Open HustleXP app
2. Swipe right to navigate through elements
3. Double tap to activate buttons
4. Listen for clear descriptions

**Expected Behavior:**
- ✅ Task cards announce: "Task: [title]. Pay: $[amount]. [distance]km away. [urgency]. [XP] XP reward."
- ✅ Quest cards announce: "Quest: [title]. Progress: [X] of [Y]. Rewards: [rewards]. [time remaining]."
- ✅ Buttons announce: "[Button name]. Button. Double tap to activate."
- ✅ Navigation tabs announce their names and states

#### Android TalkBack
```bash
Settings → Accessibility → TalkBack → ON
```

**Test Flow:**
1. Same as iOS VoiceOver
2. Use explore by touch
3. Verify all elements are reachable

#### Web Screen Readers (NVDA/JAWS)
```bash
# Install NVDA (free): https://www.nvaccess.org/
# Or use browser extension: ChromeVox
```

**Test Flow:**
1. Open HustleXP in browser
2. Use keyboard navigation (Tab/Shift+Tab)
3. Use screen reader shortcuts
4. Test all interactive elements

---

### ✅ Color Blind Mode Testing

**Location:** Settings → Accessibility → Color Blind Mode

#### Protanopia Test (Red-Weak)
1. Enable Protanopia mode
2. Navigate through app
3. Verify:
   - ✅ Success/Error states distinguishable
   - ✅ Task urgency visible
   - ✅ XP/rewards clear
   - ✅ All buttons identifiable

#### Deuteranopia Test (Green-Weak)
1. Enable Deuteranopia mode
2. Same verification as Protanopia

#### Tritanopia Test (Blue-Weak)
1. Enable Tritanopia mode
2. Same verification as Protanopia

**Critical Elements to Check:**
- Success indicators (green)
- Error indicators (red)
- Warning indicators (orange/yellow)
- Info indicators (blue)
- Primary actions (buttons)
- Progress bars
- Status badges

---

### ✅ Font Size Testing

**Location:** Settings → Accessibility → Font Size

#### Test Each Size:
1. Small (11px)
2. Default (14px)
3. Large (18px)
4. Extra Large (22px)
5. Huge (28px)

**For Each Size:**
- ✅ No text truncation
- ✅ Buttons remain readable
- ✅ Cards adjust properly
- ✅ Layout doesn't break
- ✅ All content scrollable

**Key Screens to Test:**
- Home (task cards)
- Quests (quest cards)
- Profile (stats and info)
- Leaderboard (rankings)
- Settings (all options)

---

### ✅ Reduced Motion Testing

**Location:** Settings → Accessibility → Reduced Motion

**Test Flow:**
1. Enable Reduced Motion
2. Navigate through all screens
3. Verify:
   - ✅ No auto-playing animations
   - ✅ Static alternatives present
   - ✅ All functionality preserved
   - ✅ No parallax effects
   - ✅ Simple transitions only

**Expected Changes:**
- Confetti → Simple checkmark
- Card entrances → Instant appearance
- Progress bars → No animation
- XP gains → Static update
- Level ups → Simple notification

---

### ✅ High Contrast Testing

**Location:** Settings → Accessibility → High Contrast Mode

**Test Flow:**
1. Enable High Contrast Mode
2. Check all screens
3. Verify:
   - ✅ Text contrast ratio ≥ 4.5:1 (WCAG AA)
   - ✅ Border visibility enhanced
   - ✅ Button states clear
   - ✅ Focus indicators visible
   - ✅ All icons distinguishable

**Use Contrast Checker:**
```
https://webaim.org/resources/contrastchecker/
```

**Check These Combinations:**
- Text on background
- Button text on button background
- Secondary text on surface
- Disabled states
- Placeholder text

---

### ✅ Keyboard Navigation Testing (Web Only)

**Test Flow:**
1. Open in web browser
2. Enable keyboard navigation in Accessibility Settings
3. Test shortcuts

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| Tab | Navigate forward |
| Shift + Tab | Navigate backward |
| Enter / Space | Activate element |
| Escape | Go back / Close |
| Ctrl + H | Go to Home |
| Ctrl + P | Go to Profile |
| Ctrl + L | Go to Leaderboard |
| Ctrl + Q | Go to Quests |
| Ctrl + T | Go to Tasks |
| Ctrl + S | Go to Settings |
| Ctrl + K | Search |
| / | Search |

**Verify:**
- ✅ All interactive elements reachable
- ✅ Focus order logical
- ✅ Focus indicators visible
- ✅ Shortcuts work correctly
- ✅ Modals trapfocus
- ✅ Escape closes modals

---

### ✅ Touch Target Testing

**Requirement:** Minimum 44x44 points (iOS/Android guidelines)

**Test Flow:**
1. Use finger to tap all buttons
2. Verify easy tapping without mistakes
3. Check these elements:
   - ✅ Task cards (entire card)
   - ✅ Quest cards (entire card)
   - ✅ Navigation tabs
   - ✅ Settings toggles
   - ✅ Action buttons
   - ✅ Close buttons
   - ✅ Badge icons

---

### ✅ Audio & Haptics Testing

**Location:** Settings → Accessibility → Audio & Haptics

#### Sound Effects Testing
1. Enable Sound Effects
2. Complete actions:
   - Complete task
   - Level up
   - Accept quest
   - Earn badge
3. Verify sounds play appropriately

#### Haptic Feedback Testing
1. Enable Haptic Feedback
2. Interact with:
   - Buttons (light haptic)
   - Success actions (success haptic)
   - Errors (error haptic)
   - Navigation (selection haptic)
3. Verify haptics fire correctly

#### Disable Testing
1. Disable both
2. Verify app works silently
3. Check no errors occur

---

## 🔧 Automated Testing

### Accessibility Linter (ESLint)
```bash
npm run lint
```

Should have eslint-plugin-jsx-a11y rules

### React Native Testing Library
```typescript
import { render, screen } from '@testing-library/react-native';

test('TaskCard has accessibility label', () => {
  const task = mockTask;
  render(<TaskCard task={task} onPress={jest.fn()} />);
  
  const button = screen.getByRole('button');
  expect(button).toHaveAccessibilityLabel(
    expect.stringContaining(task.title)
  );
});
```

### Web Accessibility Testing
```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run in browser DevTools
# Lighthouse → Accessibility audit
```

---

## 📊 Compliance Checklist

### WCAG 2.1 Level AA
- ✅ 1.1.1 Non-text Content
- ✅ 1.3.1 Info and Relationships
- ✅ 1.4.3 Contrast (Minimum) - 4.5:1
- ✅ 1.4.4 Resize Text - Up to 200%
- ✅ 1.4.5 Images of Text
- ✅ 2.1.1 Keyboard
- ✅ 2.1.2 No Keyboard Trap
- ✅ 2.4.3 Focus Order
- ✅ 2.4.4 Link Purpose
- ✅ 2.4.7 Focus Visible
- ✅ 2.5.3 Label in Name
- ✅ 2.5.5 Target Size - 44x44
- ✅ 3.2.3 Consistent Navigation
- ✅ 3.2.4 Consistent Identification
- ✅ 3.3.1 Error Identification
- ✅ 3.3.2 Labels or Instructions
- ✅ 4.1.2 Name, Role, Value
- ✅ 4.1.3 Status Messages

### Platform Guidelines
- ✅ iOS Human Interface Guidelines
- ✅ Android Material Design Accessibility
- ✅ React Native Accessibility API

### App Store Requirements
- ✅ Apple App Store - Accessibility
- ✅ Google Play Store - Accessibility

---

## 🐛 Common Issues to Check

### Screen Reader Issues
- [ ] Elements not announcing
- [ ] Incorrect role/label
- [ ] Redundant announcements
- [ ] Focus order wrong

### Visual Issues
- [ ] Low contrast text
- [ ] Truncated text at large sizes
- [ ] Missing focus indicators
- [ ] Invisible disabled states

### Interaction Issues
- [ ] Touch targets too small
- [ ] Keyboard navigation broken
- [ ] Focus trapped incorrectly
- [ ] Gestures required (no alternatives)

### Content Issues
- [ ] Images without alt text
- [ ] Videos without captions
- [ ] Complex interactions unexplained
- [ ] Time-based requirements

---

## ✅ Pre-Launch Verification

### Must Test Before Release:
1. ✅ Complete onboarding flow with screen reader
2. ✅ Accept and complete a task with screen reader
3. ✅ Navigate all tabs with keyboard only (web)
4. ✅ Test all 3 color blind modes on key screens
5. ✅ Test largest font size on all screens
6. ✅ Verify reduced motion works throughout
7. ✅ Test high contrast mode for readability
8. ✅ Check all touch targets ≥ 44x44
9. ✅ Verify haptics/sounds can be disabled
10. ✅ Test with real users (if possible)

### Recommended Tools:
- **iOS:** VoiceOver
- **Android:** TalkBack
- **Web:** NVDA/JAWS, axe DevTools
- **Contrast:** WebAIM Contrast Checker
- **Color Blind:** Sim Daltonism (Mac)
- **General:** Lighthouse Accessibility Audit

---

## 📱 Real User Testing

### Recruit Test Users:
- People who use screen readers daily
- People with color blindness
- People with motor impairments
- People with motion sensitivity
- People who use large text

### Test Scenarios:
1. Complete onboarding
2. Browse and accept a task
3. Complete a quest
4. Check profile and stats
5. Adjust accessibility settings
6. Use keyboard shortcuts (web)

### Collect Feedback On:
- Ease of use
- Information clarity
- Navigation efficiency
- Missing features
- Unexpected barriers

---

## 🎯 Success Criteria

App is accessible if:
- ✅ All features usable with screen reader
- ✅ All information distinguishable with color blind modes
- ✅ All text readable at 200% size
- ✅ All interactions possible with keyboard (web)
- ✅ No loss of functionality with reduced motion
- ✅ High contrast improves readability
- ✅ All touch targets ≥ 44x44
- ✅ Sounds/haptics can be disabled
- ✅ WCAG 2.1 Level AA compliant
- ✅ Platform guidelines followed

---

## 📚 Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Color Oracle](https://colororacle.org/) - Color blind simulator

### Testing Services
- [UserTesting.com](https://www.usertesting.com/)
- [Fable](https://makeitfable.com/) - Accessibility testing with people with disabilities

---

**✨ Remember:** Accessibility is an ongoing process, not a one-time checklist. Test with real users and iterate based on feedback!
