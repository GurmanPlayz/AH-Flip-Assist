# AH Flip Assist
This program that will recommend items to flip on the hypixel skyblock auction house.

### please read!
> This program uploads all AH data it finds to you local machine. This data will be used to help inprove the program. This means that the only way to improve the system is to keep a tab open in the background, preferebly in its own window, so the uploading messages will not be distracting.

> This program will not be accurate at first and the "potential profit" will not be entirely correct untill a week has passed, so it is recomended to compleatly ignore the "potential profit" untill you have had this program running consitantly for at least 5-7 days.

> You MUST allow pop-ups for the site `http://localhost:3000` for this program to work. If your web-browser initialy blocks pop-ups, then change the permission to "always allow" and reload the page.

> Even after the recomended flips are as accuate as they will get, they still may be incorrect or dangorus flips. I also recomend to have other mods that give you auction stats of an item, such as [NEU](https://github.com/Moulberry/NotEnoughUpdates/releases/). With this mod, you can use the "AH prices" as well as the "sales per day" to see if it is a safe flip.

# Instalation
## Step 1
In order for this program to work you first need to install a couple other libraries.
This step is designed for windows, however you can also use this program on mac, just find a tutorial on how to install Node.js on mac. You do not need an NVM.

First you need to install Node.js.

You can directly download this from [here](https://nodejs.org/en/download/). You do not need to install Chocolatey.
After you download follow the simple install instructions.
For more information on how to install Node.js see [here](https://www.youtube.com/watch?v=__7eOCxJyow&t=345s). You do not need to follow all the test steps if everything seems to be working.

## Step 2
Next you are going to need to install express. This instalation is much simpilar and quicker than the first.

Once you finish installing Node.js, open your command prompt. This can be done by typing cmd in the windows search bar.

Now type `npm install express@4.17.1`

Wait for this to finish before continuing.

## Step 3
Now you can download this repository. Click the "code" button in the top right of the screen. Then click "download ZIP".

Once you have downloaded the zip file navigate to it in your directory.
Open the folder by double clicking it. inside you should see another folder named `AH-Flip-Assist-main`. Drag this file out into whatever folder you want to keep this program in. 

> Note: you MUST move this file out of the original folder or it will not work. 

> If it copies the folder into the new location, you can delete the original ZIP folder that you downloaded.

Now, in the new directory this program is in, you want to open the folder and copy the file path of the `index.js` file inside this folder. You can copy the path by shift right clicking the `index.js` file and clicking the "save as path" option.

Finally open your command prompt again and type: node space the file name you just copied eg `node C:\Users\me\file_path\AH-Flip-Assist-main\index.js`.

When you press enter the text `app avaiable on http://localhost:3000!` should appear.
Now all you have to do is navigate to `http://localhost:3000` in any browser and you should see the program!
> Note: If you close the command prompt at any time the program will stop running. To start it again simpily retype `node your_file_path` in a command prompt window.

# Usage

When you first load the web-page it will take considerable longer to load all the flips. This is because it needs to run again after it uploaded the data for the first time.

### potential profit

Potenital profit shows how much lower this item is from the average price of this item over time, where the time is based on the [risk](#risk).

### profit now

Profit now is how much lower this item is from the next lowest BIN of that item.

### markdown

The markdown is how much of a markdown this item is from either the next lowest BIN (current markdown) or how much lower it is from the average price of this item over a certain amount of time (potential markdown).

> You can click on any row in the table to copy the /viewauction id 

## Settings

You can acsess your settings from the gear icon in the top left corner of the screen. 

> You must reload the page for new settings to take effect.

> You must write all values out as numbers without commas.

### Budget
This program will only recomend items to flip that are under this value. The default is 1,000,000.

### Risk
The risk value will determine how items will be averaged to find the "potential profit" and the "potential markdown".

This value is the maximum time that it will average items. eg. if you it was 24 it would average the price of that item over the last 24 hours to find the average price.

If you have this value too low it may recomend you items that are currently being market manipulated. However, if you have it too high, it could recomend you items that were once worth something but not anymore.

## Graphs

You can open the graphs menu by clicking the graph icon in the top right corner of the screen.

> These graphs depend on data saved to you local machine, so they will not have much data untill you have run the program many times over a period of time.

### Using Graphs

To view the item price history for a specific item, search for it in the search bar. 

The graph will show the price of the item over the time selected from the dropdown above.

The grey lines in the background show the times when data was saved to you computer. If this line is red, it means that data was saved then, but there were none of this item on the AH.

### Volitle markets

If the price of item is especialy volitle, it will say so underneath the graph as well as how volitle it is.

> Note: The volitility stated depends on the time scale selected.

### Extra information

Underneath the graph the current lowest BIN for the item is stated.

It also states the highest price of the lowest BIN as well as the lowest price for the lowest BIN of the item. Time scale also affects this.

## Quickly accessing Graphs

You can quickly access the graphs for an item by clicking the information symbol at the very left of a recommended flip.

> If this information symbol is a red exclamation mark it means that that item has a volitile price currently. The brighter red this exclamation mark is, the more volitle the price is.

***

# Thats it!
## I hope that this program is helpful to you.
