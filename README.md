# AH-Flip-Assist
This program that will recommend items to flip on the hypixel skyblock auction house.

### please read!
> This program uploads all AH data it finds to you local machine. This data will be used to help inprove the program. This means that the only way to improve the system is to keep a tab open in the background, preferebly in its own window, so the uploading messages will not be distracting.

> This program will not be accurate at first and the "potential profit" will not be entirely correct unill a week has passed, so it is recomended to compleatly ignore the "potential profit" untill you have had this program running consitantly for at least 5-7 days.

> You MUST allow pop-ups for the site `http://localhost:3000` for this program to work. If your web-browser initialy blocks pop-ups, then change the permission to "always allow" and reload the page.

# Instalation
## Step 1
In order for this program to work you first need to install a couple other libraries.


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
