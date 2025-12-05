# Requirements Document

## Introduction

The Haunted Runner Game is a 3D endless runner experience built with React Three Fiber, featuring lane-based movement, physics-based jumping, collision detection, and scoring mechanics. Players navigate through a haunted environment, collecting coins while avoiding obstacles like graves and ghosts, with a lives-based progression system.

## Glossary

- **Haunted_Runner_System**: The complete game implementation including UI, 3D scene, physics, and game state management
- **Player_Character**: The 3D hero character controlled by the player
- **Lane_System**: Three parallel paths (left, middle, right) where gameplay occurs
- **Game_State**: The current status of the game (menu, playing, gameover) and associated data
- **Physics_Engine**: The gravity and collision detection system managing character movement
- **Obstacle**: Any game object that causes damage when collided with (graves, ghosts)
- **Collectible**: Any game object that provides points when collected (coins)
- **Collision_Detection**: The system that determines when the player character intersects with game objects
- **Score_System**: The mechanism for tracking and displaying player progress and achievements

## Requirements

### Requirement 1

**User Story:** As a player, I want to control a character that can move between lanes and jump, so that I can navigate through the game world and avoid obstacles.

#### Acceptance Criteria

1. WHEN a player presses the left arrow key, THE Haunted_Runner_System SHALL move the Player_Character to the adjacent left lane if available
2. WHEN a player presses the right arrow key, THE Haunted_Runner_System SHALL move the Player_Character to the adjacent right lane if available
3. WHEN a player presses the up arrow key, THE Haunted_Runner_System SHALL apply upward velocity to the Player_Character using the Physics_Engine
4. WHEN the Player_Character is in the air, THE Physics_Engine SHALL apply gravity at 0.008 units per frame to create realistic falling motion
5. WHEN the Player_Character touches the ground, THE Physics_Engine SHALL reset the jumping state and apply a small bounce effect

### Requirement 2

**User Story:** As a player, I want to collect coins to increase my score, so that I can track my progress and compete for high scores.

#### Acceptance Criteria

1. WHEN the Player_Character collides with a Collectible coin, THE Score_System SHALL increase the score by 10 points
2. WHEN the Player_Character collides with a Collectible coin, THE Score_System SHALL increment the coins collected counter by 1
3. WHEN a Collectible coin is collected, THE Haunted_Runner_System SHALL remove the coin from the game world
4. WHEN coins are spawned, THE Haunted_Runner_System SHALL place them in lanes not occupied by obstacles
5. WHEN the game is playing, THE Haunted_Runner_System SHALL spawn new Collectible coins every 1.5 seconds with 70% probability per available lane

### Requirement 3

**User Story:** As a player, I want to avoid obstacles that reduce my lives, so that I can survive longer and achieve higher scores.

#### Acceptance Criteria

1. WHEN the Player_Character collides with an Obstacle grave, THE Haunted_Runner_System SHALL reduce the player's lives by 1
2. WHEN the Player_Character collides with an Obstacle ghost, THE Haunted_Runner_System SHALL reduce the player's lives by 1
3. WHEN a collision occurs, THE Collision_Detection SHALL enforce a 500 millisecond cooldown period to prevent multiple collisions
4. WHEN the player's lives reach 0, THE Game_State SHALL transition to gameover status
5. WHEN obstacles are spawned, THE Haunted_Runner_System SHALL create 1-2 grave obstacles every 1.5 seconds in random lanes

### Requirement 4

**User Story:** As a player, I want to see my current game status including score, lives, and coins collected, so that I can make informed decisions during gameplay.

#### Acceptance Criteria

1. WHEN the game is playing, THE Haunted_Runner_System SHALL display the current score prominently in the game UI
2. WHEN the game is playing, THE Haunted_Runner_System SHALL display the remaining lives as heart icons in the game UI
3. WHEN the game is playing, THE Haunted_Runner_System SHALL display the total coins collected in the game UI
4. WHEN the Game_State changes, THE Haunted_Runner_System SHALL update all UI elements immediately to reflect the new state
5. WHEN control instructions are needed, THE Haunted_Runner_System SHALL display keyboard controls and game objectives clearly

### Requirement 5

**User Story:** As a player, I want to navigate between game states (menu, playing, gameover), so that I can start, play, and restart the game as desired.

#### Acceptance Criteria

1. WHEN the game starts, THE Game_State SHALL initialize to menu status with default values (3 lives, 0 score, 0 coins)
2. WHEN a player clicks the start button, THE Game_State SHALL transition to playing status and reset all game counters
3. WHEN the player's lives reach 0, THE Game_State SHALL transition to gameover status and display the final score
4. WHEN a player clicks play again, THE Game_State SHALL reset to menu status with all counters restored to default values
5. WHEN a player clicks the back button, THE Haunted_Runner_System SHALL call the onBack callback to return to the main game hub

### Requirement 6

**User Story:** As a player, I want to experience a 3D haunted environment with atmospheric lighting and effects, so that I feel immersed in the game world.

#### Acceptance Criteria

1. WHEN the game is playing, THE Haunted_Runner_System SHALL render a 3D scene using React Three Fiber with shadows enabled
2. WHEN the 3D scene loads, THE Haunted_Runner_System SHALL apply atmospheric fog with haunted color scheme (#1a0f0a)
3. WHEN lighting is applied, THE Haunted_Runner_System SHALL use ambient lighting (5.6 intensity) and directional lighting (0.7 intensity) with orange tones
4. WHEN the camera is positioned, THE Haunted_Runner_System SHALL place it at position [0, 4, 15] with 60-degree field of view for optimal gameplay visibility
5. WHEN environmental elements are rendered, THE Haunted_Runner_System SHALL include running path, decorations, and sky components for immersion

### Requirement 7

**User Story:** As a player, I want ghost enemies that move in unpredictable patterns, so that the game provides varied and challenging obstacles.

#### Acceptance Criteria

1. WHEN ghost spawning occurs, THE Haunted_Runner_System SHALL create ghost enemies every 10-15 seconds at random intervals
2. WHEN a ghost is spawned, THE Haunted_Runner_System SHALL position it at coordinates [0, 2.5, -30] with flying height of 2.5 units
3. WHEN a ghost moves, THE Haunted_Runner_System SHALL implement wave-like motion across lanes to create unpredictable movement patterns
4. WHEN the Player_Character collides with a ghost, THE Collision_Detection SHALL trigger the same damage system as grave obstacles
5. WHEN a ghost moves beyond the visible area, THE Haunted_Runner_System SHALL remove it from the game world to maintain performance

### Requirement 8

**User Story:** As a developer, I want the game to integrate seamlessly with the existing haunted house game hub, so that players can navigate between different game experiences.

#### Acceptance Criteria

1. WHEN the game component is instantiated, THE Haunted_Runner_System SHALL accept GameProps interface with onBack callback function
2. WHEN the back button is clicked, THE Haunted_Runner_System SHALL call the provided onBack callback without modifying game hub state
3. WHEN the game renders, THE Haunted_Runner_System SHALL use the existing BackButton component for consistent UI styling
4. WHEN the game is integrated, THE Haunted_Runner_System SHALL follow the established component structure with Canvas wrapper and proper styling
5. WHEN the game exports, THE Haunted_Runner_System SHALL provide a default export compatible with the existing game loading system