# Stardew Clone - Future Ideas

Here are 5 ideas for expanding our Stardew Valley clone, focusing on mechanics that would naturally build upon the engine we've just created:

### 1. Watering Can & Soil Moisture
Right now, crops grow automatically on dry dirt. We could add a **Watering Can** tool.
*   **Mechanic**: Using the watering can on a dirt tile changes it to "Wet Dirt" (a new darker brown Sprite Map). 
*   **Farming Impact**: Crops will *only* progress to the next growth stage if the dirt underneath them is wet.

### 2. Day/Night Cycle & Sleeping
The clock currently reads a static "Day 1 | 12:00 PM". We can make time pass.
*   **Time Progression**: The clock ticks forward every few seconds. As it gets late (e.g., 6:00 PM), a dark blue overlay slowly fades in over the canvas to simulate evening and night.
*   **Sleeping**: We add a "House" or "Bed" tile. Interacting with it ends the day, increments the Day counter, resets the time to 6:00 AM, and triggers daily calculations (like crop growth).

### 3. Stamina / Energy Bar
Every swing of the Axe or Hoe in Stardew Valley costs energy.
*   **The System**: Add an Energy Bar UI element. Every time a tool is used, energy decreases.
*   **Consequences**: If energy hits zero, the player becomes "exhausted" (movement speed is halved) or passes out. 
*   **Recovery**: The player can eat the Turnips they harvest to regain energy, or sleep to restore it fully for the next day.

### 4. Shipping Bin & Economy (Gold)
Farming is profitable! We need a way to earn money.
*   **Shipping Bin Tile**: Place a special box on the map. 
*   **Selling**: Interacting with the bin opens a simple prompt to sell items from the inventory (like Turnips or Wood) in exchange for Gold (`G`). 
*   **UI Update**: Add a Gold counter to the top-right UI panel.

### 5. Farm Decor: Fences and Paths
A huge part of farming games is decorating to make the farm look nice.
*   **New Tools/Items**: Using the Wood and Stone in the inventory, we can add "Wooden Fence" and "Stone Path" tools.
*   **Placing**: The player can switch to these tools and place nice-looking paths or fences on grass and dirt tiles, giving them creative control over how their farm looks.
