
/**

  ________                    .__         
 /  _____/  ____ _____ _______|  | ___.__.
/   \  ___ /    \\__  \\_  __ \  |<   |  |
\    \_\  \   |  \/ __ \|  | \/  |_\___  |
 \______  /___|  (____  /__|  |____/ ____|
        \/     \/     \/           \/     
  _________              __           
 /   _____/ ____ _____  |  | __ ____  
 \_____  \ /    \\__  \ |  |/ // __ \ 
 /        \   |  \/ __ \|    <\  ___/ 
/_______  /___|  (____  /__|_ \\___  >
        \/     \/     \/     \/    \/    
             
  * @desc Gnarly Snake - Retro Snake Game      
  * @author Adam Bowling (adambowling@adambowlingdesign.com)  		
  * @todo Ideally, alot of the functions/objects could have exception handling in order to better catch errors
  * @todo Collision can be wonky at times
  * @todo Sound & Music would be nice
  * @todo toggling the fullscreen as menu loads, breaks canvas size
  * @todo add custome game over messages
  * @todo add real graphics/sprites for the level, snake, and food
  * @todo wiggle/shake is hard to see at higher speeds, add in a scale-up & fade-in to enhance
  * @todo fix collision errors where a second piece of food is gemerated close to one just eaten
  * @todo tweak fullscreen across different browsers
*/


var gnarlySnake = (function () {
 
  // Instance stores a reference to the Singleton
  var SnakeGame;
 
  function init() {
  
	//Set Constants for the game  
	var requestAnimationFrame =  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
	var controlKeys = {l: 37, r: 39, u: 38, d: 40, spc: 32, enter: 13, num1: 49 , num2: 50, num3: 51, f:70};
	
	
	/**  
	  * @desc Object that handles the base Game System Logic
	*/  
	
	var GameSys = {
		
		//Define our basic canvas object. 
		canvas:  document.getElementById("gnarlyCanvas"),
		context: document.getElementById("gnarlyCanvas").getContext('2d'),
		
		//Keep Score
		score: 0,
		
		//Keep current gameSpeed 
		gameSpeed: 0,
		
		//Used to store unqiue idendifier for the main requestAnimationFrame and timer
		animReqID: undefined,
		gameTimer: undefined,
		
		//Store our pause state
		pauseEnabled: false,
		
		//Object to hold our different game options
		gameOptions: {fullscreen : false, imgDir: "img/", snakeSegments: 4},
		
		//Store the screensize of the game, used to load graphics based upon the width of the screen 
		screenSize: "large",

		//Event lister for the keyboard controls
		eventListener: undefined,
		reset: false,
		
		
		/**  
		  * @desc Handles the keyboard mappings for the evenListener which controls the snake movements, game pause, and fullscreen
		*/  
		
		eventHandler: function(e){
										
			if(e.keyCode == controlKeys.l || e.keyCode == controlKeys.r || e.keyCode == controlKeys.u || e.keyCode == controlKeys.d){
				Snake.controlSnake(e.keyCode);	
			}
			
			if(e.keyCode == controlKeys.f){	
				GameSys.toggleFullscreen(GameSys.canvas);
			}
			
			
			if(e.keyCode == controlKeys.spc){
				GameSys.pauseEnabled = !GameSys.pauseEnabled;
			}
			
			e.preventDefault();

			return false;
		
		},		
		
		/** 
		  * @desc utility function to clear the canvas when needed
		  * @return null
		*/  
		
		clearCanvas: function(){
		
			GameSys.context.clearRect(0, 0, GameSys.canvas.width, GameSys.canvas.height);
			GameSys.context.fillStyle = GameSys.themes[GameSys.gameOptions.theme].bgColor;
			GameSys.context.strokeStyle = GameSys.themes[GameSys.gameOptions.theme].wallColor;
			GameSys.context.lineWidth = 20;
			GameSys.context.fillRect(0, 0, GameSys.canvas.width, GameSys.canvas.height)
			GameSys.context.strokeRect(0, 0, GameSys.canvas.width, GameSys.canvas.height);
			//GameSys.setupCanvas();
			
		},
		
		/** 
		  * @desc utility to setup the canvas/game board using the assigned game options. 
		  * @return null
		*/  
		
		setupCanvas: function(){
			
			//Calculate the width and height for modern browsers. Additional code could be added for older IE Support
			//Size of the canvas is calculated for a 4:3 aspect ratio based upon the available width. 
			
			var width = 0;
			var height = 0;
			
			var containerHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById("game-container"), '').getPropertyValue('height'), 10);
			var maxHeight = parseInt(document.documentElement.clientHeight);				
			var maxWidth = parseInt(document.defaultView.getComputedStyle(document.getElementById("game-container"), '').getPropertyValue('width'), 10);		        
			
			var calcHeight;
			
			if(containerHeight < maxHeight){
				calcHeight = maxHeight - containerHeight;
			}else{
				calcHeight = maxHeight;
			}
			
	        height = Math.round((maxWidth/4)*3);	
	        
	        if(height > calcHeight){
		        
		        height = calcHeight;
		        width = Math.round((calcHeight/3)*4);
		        
	        }else{
		        
		        width = maxWidth;
		        
	        }
	        
	        console.log("h: "+height+" w: "+width+" maxH: "+maxHeight+" maxW: "+maxWidth+" cH: "+calcHeight);
	        
						
			//Setup our game area using the canvas object	
			
			GameSys.canvas.height = height;
			GameSys.canvas.width = width;		
			GameSys.canvas.tabIndex = 1;
			
			//Canvas colors are defined by the themes found in the game options
			
			GameSys.context.fillStyle = GameSys.themes[GameSys.gameOptions.theme].bgColor;
			GameSys.context.strokeStyle = GameSys.themes[GameSys.gameOptions.theme].wallColor;
			GameSys.context.lineWidth = 20;
			GameSys.context.fillRect(0, 0, width, height)
			GameSys.context.strokeRect(0, 0, width, height);
			
			//A *** very basic *** method of setting three levels of screen sizes in order to load various image sizes based on the screen width using media queries
			
			GameSys.screensize = "large";
			
			if(window.matchMedia('(max-width: 767px)').matches){
				
				if(GameSys.gameOptions.debug) console.log("Need Graphocs for Medium Device");				
				GameSys.screensize = "medium";	
					
			}
			
			if(window.matchMedia('(max-width: 480px)').matches){
				
				if(GameSys.gameOptions.debug) console.log("Need Graphocs for Small Device");
				GameSys.screensize = "small";					
			
			}
			
			
			//Add event handler for mouse click
			GameSys.canvas.addEventListener("click", function(e){
				
				console.log("Resetting Game due to mouse click.");
				
				//The could be evolved....
				
				Snake.isDead = true;
				GameSys.reset = true;
				
			}, false);
		},
		
		/** 
		  * @desc Renders the score. Also handles the local storage object if available, storing and updating the high score
		  * @return null
		*/  
		
		showScore: function(){
			
			//Text coords to show scores		
			var x = GameSys.canvas.width - 60;
			var y = 60;
	
			//Placeholder for the highscore, left blank if no localStorage available.
			var highscore = ""
			
			
			//Test for local storage, and if it exists either create the highscore, or see if it needs updated.			
			if(typeof(Storage)!=="undefined"){
			
				if (!localStorage.highscore) {
					
					localStorage.setItem("highscore",GameSys.score);
					
				} else {
					
					if(GameSys.score > localStorage.highscore){
						localStorage.highscore = GameSys.score;
					}
				}
				
				highscore = "   Your Highscore: "+localStorage.highscore;
			}
			
			GameSys.context.font="20px Sans-Serif";
			GameSys.context.textAlign = 'right';
			GameSys.context.fillStyle = GameSys.themes[GameSys.gameOptions.theme].textColor;
			GameSys.context.fillText("Score: "+GameSys.score+highscore, x, y);
		},
		
		/** 
		  * @desc Starts the game by "Hatching" a snake and initializing the loop
		  * @return null
		*/ 
		
		startgame: function(){
		
			GameSys.resetDefaults();
		
			GameSys.gameSpeed = GameSys.levels[GameSys.gameOptions.difficulty].gameSpeed;						
			GameSys.score = 0;
			GameSys.clearCanvas();
			Food.placeFood();
			Snake.hatchSnake();
			
			GameSys.eventListener = document.addEventListener("keydown", GameSys.eventHandler); 
			GameSys.rungame();

		},
		
		/** 
		  * @desc Resets the defaults for the Snake, Food
		  * @return null
		*/ 
		
		
		resetDefaults: function() {
			
			var snakeDefaults = {
				startSegments: GameSys.gameOptions.snakeSegments,
				xpos : GameSys.canvas.width / 2,
				ypos : GameSys.canvas.height / 2,
				heading : "l",
				segments : [],
				segmentCount : 0,
				shaking : false,
				shakeAmount: 10,
				size : 6,
				spacing : 0, 
				isDead : true,
				snakeColor: GameSys.themes[GameSys.gameOptions.theme].snakeColor,
				headColor: GameSys.themes[GameSys.gameOptions.theme].headColor
			}
			
			_.extend(Snake, snakeDefaults);
			
			var foodDefaults = {
				hasFood: false,
				padding: GameSys.levels[GameSys.gameOptions.difficulty].wallPadding,
				foodColor: GameSys.themes[GameSys.gameOptions.theme].foodColor
			}
			
			_.extend(Food, foodDefaults);			
			
		},
		
		/** 
		  * @desc Loop that makes the game run
		  * @return null
		*/ 
		
		rungame: function() {
	
			if(Snake.isDead){
				
				if(GameSys.gameOptions.debug) console.log("That is a dead snake.");
				
				document.removeEventListener("keydown", GameSys.eventHandler);
				GameSys.eventListener = undefined;
				
				//Kill off the requestAnimationFrame and main timer
				cancelAnimationFrame(GameSys.animReqID);
				GameSys.animReqID = undefined;			
				
				clearTimeout(GameSys.gameTimer);
				GameSys.gameTimer = undefined;
				
				//Initialize the GameOver Menu
				MenuSys.currentMenu = "end";
				MenuSys.initMenu();		
											
	
			}else{
		
				if(!GameSys.pauseEnabled && !Snake.isDead){

					GameSys.clearCanvas();			
					GameSys.showScore();
					Snake.setupSegments();
					Snake.renderSnake();
					Food.placeFood();
					Snake.collisionDetect();

				}
				
				
				GameSys.gameTimer = setTimeout(function() {
					GameSys.animReqID = requestAnimationFrame(GameSys.rungame);
				}, 1000 / GameSys.gameSpeed);
	
			}
		},	
		
		/** 
		  * @desc Simple function that uses the fullscreen API in order to toggle fullscreen.
		  * @todo Need to tweak across various browser platforms, especially chrome.
		  * @return null
		*/ 
		
		toggleFullscreen: function() {
			
			if(!GameSys.gameOptions.fullscreen){
			
				if(GameSys.canvas.requestFullscreen) {
				
					GameSys.canvas.requestFullscreen();
				
				} else if(GameSys.canvas.mozRequestFullScreen) {
				
					GameSys.canvas.mozRequestFullScreen();
				
				} else if(GameSys.canvas.webkitRequestFullscreen) {
				
					GameSys.canvas.webkitRequestFullscreen();
				
				} else if(GameSys.canvas.msRequestFullscreen) {
				
					GameSys.canvas.msRequestFullscreen();
				
				}
				
				GameSys.gameOptions.fullscreen = true;
				
			}else{
			
				if(document.exitFullscreen) {
	
					document.exitFullscreen();
		
				} else if(document.mozCancelFullScreen) {
			
					document.mozCancelFullScreen();
			
				} else if(document.webkitExitFullscreen) {
				
					document.webkitExitFullscreen();
				
				}	
				
				GameSys.gameOptions.fullscreen = false;	
						
			}
				
	    },		
			
			
	}
	
	/**  
	  * @desc Object that contains the very basic menu system done using graphics
	  * @todo It would be ideal to replace some of the graphics with actual text items using custom fonts
	*/  
	
	var MenuSys = {
		
		//Keep track as to whether a menu needs to be displayed
		showMenu: false,
		
		//Keep track as to whether a menu has actually been loaded and drawn
		drawn: false,
		
		//Keep track of the menu that needs to be displayed
		currentMenu: "none", 
		
		//Stores the unique identifier for the requestAnimation frame used to display menues
		animReqID: undefined,
		
		//Used to store the evenlistener object for the keyboard commands so it can be destroyed when not needed.
		eventListener: undefined,
		
		
		
		/**  
		  * @desc Our menus that will be displayed at the beggining and end of the game. Each menu has it's own eventHandler function in
		  * order to process specific keyboard commands for the menu displayed.
		  *
		  * @todo Change the logic so that only the necessary images are loaded, and make sure that the loaded trigger is executed properly
		*/  
		
		menus: {
			
			/**  
			  * @desc Main menu displayed at the start of the game
			*/
			
			mainMenu : {
			
				//Used in corespondence with MenuSys.currentMenu in order to display the correct menu
				trigger: "main", 
				
				//For this -simple- demonstration, each menu has three different image sizes that can be displayed based on screen width
				
				/**  
				  * @desc loads the small version of the menu
				  * @return image object 
				*/
				small : function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_start_title_003.png", MenuSys.menus.mainMenu)},
				
				/**  
				  * @desc loads the medium version of the menu
				  * @return image object 
				*/
				medium : function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_start_title_002.png", MenuSys.menus.mainMenu)},
				
				/**  
				  * @desc loads the large version of the menu
				  * @return image object 
				*/
				large : function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_start_title_001.png", MenuSys.menus.mainMenu)},
				
				//Triggered when an image has been loaded
				loaded : false,
		
		
				/**  
				  * @desc Handles the keyboard controls for this menu
				  * @return image object 
				*/

				eventHandler: function(e){										
					
					//When enter is pressed, set the next menu to be displayed - Theme Selection
						
					if(e.keyCode == controlKeys.enter){		
					
						//Remove the eventLister for the menus 
						document.removeEventListener("keydown", MenuSys.menus.mainMenu.eventHandler);
						MenuSys.eventListener = undefined;					
											
						MenuSys.currentMenu = "theme";
						MenuSys.reset();
					}
				}
				
			},
			
			/**  
			  * @desc Theme selection menu
			*/
			
			themeMenu : {
			
				//Used in corespondence with MenuSys.currentMenu in order to display the correct menu
				trigger: "theme", 
				
				//For this -simple- demonstration, each menu has three different image sizes that can be displayed based on screen width
				
				/**  
				  * @desc loads the small version of the menu
				  * @return image object 
				*/
				small : function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_theme_title_003.png", MenuSys.menus.themeMenu)},
				
				/**  
				  * @desc loads the medium version of the menu
				  * @return image object 
				*/
				medium : function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_theme_title_002.png", MenuSys.menus.themeMenu)},
				
				/**  
				  * @desc loads the large version of the menu
				  * @return image object 
				*/
				large : function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_theme_title_001.png", MenuSys.menus.themeMenu)},
				
				//Triggered when an image has been loaded
				loaded : false,
			
				//When enter is 1,2,3 are pressed, set the theme for the game
				
				/**  
				  * @desc Handles the keyboard controls for this menu
				  * @return image object 
				*/
				
				eventHandler: function(e){
																
					if(e.keyCode == controlKeys.num1){

						//Remove the eventLister for the menus 
						document.removeEventListener("keydown", MenuSys.menus.themeMenu.eventHandler);
						MenuSys.eventListener = undefined;

						MenuSys.currentMenu = "diff";
						GameSys.gameOptions.theme = "natural";
						MenuSys.reset();
					}
					
					if(e.keyCode == controlKeys.num2){

						//Remove the eventLister for the menus 
						document.removeEventListener("keydown", MenuSys.menus.themeMenu.eventHandler);
						MenuSys.eventListener = undefined;

						MenuSys.currentMenu = "diff";
						GameSys.gameOptions.theme = "lava";
						MenuSys.reset();
					}
					
					if(e.keyCode == controlKeys.num3){
					
						//Remove the eventLister for the menus 
						document.removeEventListener("keydown", MenuSys.menus.themeMenu.eventHandler);
						MenuSys.eventListener = undefined;
					
						MenuSys.currentMenu = "diff";						
						GameSys.gameOptions.theme = "monochrome";
						MenuSys.reset();
					}
					
				}		
			},
			
			/**  
			  * @desc Difficulty selection menu
			*/
			
			diffMenu : {
			
				//Used in corespondence with MenuSys.currentMenu in order to display the correct menu
				trigger: "diff", 
				
				//For this -simple- demonstration, each menu has three different image sizes that can be displayed based on screen width
				
				/**  
				  * @desc loads the small version of the menu
				  * @return image object 
				*/
				small : function(){ return  MenuSys.processImage(GameSys.gameOptions.imgDir+"game_diff_title_003.png", MenuSys.menus.diffMenu)},
				
				/**  
				  * @desc loads the medium version of the menu
				  * @return image object 
				*/
				medium : function(){ return  MenuSys.processImage(GameSys.gameOptions.imgDir+"game_diff_title_002.png", MenuSys.menus.diffMenu)},
				
				/**  
				  * @desc loads the large version of the menu
				  * @return image object 
				*/
				large : function(){ return  MenuSys.processImage(GameSys.gameOptions.imgDir+"game_diff_title_001.png", MenuSys.menus.diffMenu)},

				//Triggered when an image has been loaded
				loaded : false,
				
				
				//When enter is 1,2,3 are pressed, set the difficulty for the game, then start the game.
				
				/**  
				  * @desc Handles the keyboard controls for this menu
				  * @return image object 
				  * @todo consolodate more of the reset code into MenuSys.reset() since it varies from the other menus
				*/
				
				eventHandler: function(e){

					if(e.keyCode == controlKeys.num1){
					
						//Set the difficulty level
						GameSys.gameOptions.difficulty = "sissy";
												
						//Reset the menu system and disable the eventlistener
						MenuSys.currentMenu = "none";
						MenuSys.showMenu = false;
						MenuSys.drawn = false;
						
						document.removeEventListener("keydown", MenuSys.menus.diffMenu.eventHandler);
						MenuSys.eventListener = undefined;
						
						//Since we are going to start the game, get rid of the requestAnimationFrame loop for the menus
						cancelAnimationFrame(MenuSys.animReqID);
						MenuSys.animReqID = undefined;
						
						//Start the game
						GameSys.startgame();
						
					}
					
					if(e.keyCode == controlKeys.num2){
						
						//Set the difficulty level
						GameSys.gameOptions.difficulty = "manly";
					
						//Reset the menu system and disable the eventlistener
						MenuSys.currentMenu = "none";
						MenuSys.showMenu = false;
						MenuSys.drawn = false;
						
						document.removeEventListener("keydown", MenuSys.menus.diffMenu.eventHandler);
						MenuSys.eventListener = undefined;
						
						//Since we are going to start the game, get rid of the requestAnimationFrame loop for the menus
						cancelAnimationFrame(MenuSys.animReqID);
						MenuSys.animReqID = undefined;

						//Start the game
						GameSys.startgame();
					}
					
					if(e.keyCode == controlKeys.num3){
						
						//Set the difficulty level
						GameSys.gameOptions.difficulty = "metalcore";
					
						//Reset the menu system and disable the eventlistener
						MenuSys.currentMenu = "none";
						MenuSys.showMenu = false;
						MenuSys.drawn = false;
						
						document.removeEventListener("keydown", MenuSys.menus.diffMenu.eventHandler);
						MenuSys.eventListener = undefined;
						
						//Since we are going to start the game, get rid of the requestAnimationFrame loop for the menus
						cancelAnimationFrame(MenuSys.animReqID);
						MenuSys.animReqID = undefined;
						
						//Start the game
						GameSys.startgame();
						
						
					}							
					
				}				
			},
			
			/**  
			  * @desc Game Over menu, restarts the game when enter is pressed.
			  @todo consolodate more of the reset code into MenuSys.reset() since it varies from the other menus
			*/
			
			endMenu : {
			
				//Used in corespondence with MenuSys.currentMenu in order to display the correct menu
				trigger: "end", 
				
				//For this -simple- demonstration, each menu has three different image sizes that can be displayed based on screen width
				
				/**  
				  * @desc loads the small version of the menu
				  * @return image object 
				*/
				small: function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_end_title_003.png", MenuSys.menus.endMenu)},
				
				/**  
				  * @desc loads the medium version of the menu
				  * @return image object 
				*/
				medium: function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_end_title_002.png", MenuSys.menus.endMenu)},
				
				/**  
				  * @desc loads the large version of the menu
				  * @return image object 
				*/
				large: function(){ return MenuSys.processImage(GameSys.gameOptions.imgDir+"game_end_title_001.png", MenuSys.menus.endMenu)},
				
				//Triggered when an image has been loaded
				loaded : false,
				
				/**  
				  * @desc Handles the keyboard controls for this menu
				  * @return image object 
				*/
				
				eventHandler: function(e){										

					if(e.keyCode == controlKeys.enter){		
						
						//MenuSys.currentMenu = "main";
						//MenuSys.reset();
						
						
						MenuSys.showMenu = false;
						MenuSys.drawn = false;
						GameSys.clearCanvas();
						MenuSys.currentMenu = "main";
						
						document.removeEventListener("keydown", MenuSys.menus.endMenu.eventHandler);
						MenuSys.eventListener = undefined;
						
					}

					
				}
			}
						
		},
		
		
		/**  
		  * @desc Default reset code when events are registered for menus
		  * @return null 
		*/
		
		reset: function(){
			
			//Reset the menu trackers
			MenuSys.showMenu = false;
			MenuSys.drawn = false;
			
			//Clear the canvas between menus
			GameSys.clearCanvas();
			
		},
		
		/**  
		  * @desc Loads the image for a menu item and markes the item as loaded when image has finished loading
		  * @param string source - string containing the path to the image file
		  * @param string menu - the menu that is requesting the object
		  * @return image object
		*/
		
		processImage: function(source, menu){
						
			var loadImage = new Image();
			
			loadImage.src = source;
			
			loadImage.onload = function(){
				menu.loaded = true;
			}
			
			return loadImage;
			
		},
		
		/**  
		  * @desc Checks to see if the menu needs to be displayed, and if so, do it.
		  * @return null
		*/
		
		initMenu: function(){		
			
			//Toggles the menu system when a menu is set to be displayed and the snake is dead
		
			if(MenuSys.currentMenu != "none" && Snake.isDead){				
				
				if(GameSys.reset){
					
					MenuSys.currentMenu = "main";
					GameSys.gameOptions.theme = "monochrome";
					//GameSys.clearCanvas();
					GameSys.reset = false;
					
				}
				
				//Load the menu system, and start the requestAnimationFrame loop
				
				MenuSys.loadMenu();
				MenuSys.animReqID = requestAnimationFrame(MenuSys.initMenu);
			
			}
			
		},			
		
		/**  
		  * @desc Checks to see if the menu needs to be displayed, and if so, do it.
		  * @return null
		*/
		
		loadMenu: function(){
			
			//Temp variables to hold the selected menu and image objects			
			
			var selectedMenu;
			var menuImage;
			
			if(GameSys.gameOptions.debug) console.log("Need Menu Size: "+GameSys.screensize); 
			
			//Loop through the available menus, then  determine which one will be displayed 
			
			_.each(MenuSys.menus, function(value, key){
				
				if(MenuSys.currentMenu == value.trigger){
					
					//Set the menu and image variables based upon the screensize
					
					switch(GameSys.screensize){
						
						case "large":
							
							selectedMenu = key;
							menuImage = value.large();
							break;
							
						case "medium":
						
							selectedMenu = key;
							menuImage = value.medium();
							break;
							
						case "small":
						
							selectedMenu = key;
							menuImage = value.small();
							break;
							
						default:
						
							selectedMenu = key;
							menuImage = value.large();
							break;
						
					}
				
				}
				
			});
								
			//Make sure that the image is loaded, then if no image is displayed reset the everything
		
		   if(MenuSys.menus[selectedMenu].loaded === true){		  
		   
	   			if(MenuSys.showMenu == false && MenuSys.currentMenu != "none" ){ 	

	   				if(MenuSys.currentMenu == "end"){
		   				
		   				//Reset the theme to monochrome when the game ends
						GameSys.gameOptions.theme = "monochrome";
						
					}
					
					//Add the event listener for the 
			   		MenuSys.eventListener = document.addEventListener("keydown",MenuSys.menus[selectedMenu].eventHandler);				   	
			   		MenuSys.showMenu = true;	
			   		GameSys.clearCanvas();			    
			   	}
			   	
		   }
		   	   
		   //Render the menu to the center of the canvas
		   	
		   if(MenuSys.showMenu && !MenuSys.drawn){	
				GameSys.context.drawImage(menuImage, (GameSys.canvas.width / 2 - menuImage.width / 2),(GameSys.canvas.height / 2 - menuImage.height / 2));
				MenuSys.drawn = true;
	       }
	       
			
		}
		
	}

	/**  
	  * @desc ssssssSnake. Object to contain all of our snake code.
	*/  
	
	var Snake = {
		
		/**  
		  * @desc Initializes the snake at the beginning of a game
		  * @return null 
		  * @todo The difficulty multiplier could be moved into the game options.
		*/  
			
		hatchSnake: function(){
		
			if(GameSys.gameOptions.debug === true) console.log("It's mutagenic growth!");
			
			//Make sure that the key values are reset at the beginning of a game
			Snake.spacing = Snake.size * 1.4;
			Snake.segmentCount = 0;				
			Snake.segments = [];
			Snake.isDead = false;
			
			//Calculate the snake size based on the screen ratio
			Snake.size = Snake.size * getRatio();
			
			
			//Set the segment could based upon the difficulty 
			
			switch (GameSys.gameOptions.difficulty){
																											
				case "manly":
					
					Snake.segmentCount = Snake.startSegments * 2;
					
					break;
					
				case "metalcore":
				
					Snake.segmentCount = Snake.startSegments * 4;
				
					break;
					
				default:
				
					Snake.segmentCount = Snake.startSegments;
					break;					
				
			}
			
			
			//Create the starting snake segments
		
			_.times(Snake.segmentCount, function(n){
					
				//Breakdown of a snake segment	
					
				Snake.segments[n] = {
				
					//Coordinates
					xpos : Snake.xpos, 
					ypos : Snake.ypos, 
					
					//Flag to determine if the current segment should shake/wiggle
					shake: false, 
					
					//Essentially a counter for how many times the segment has shaken
					shakeAmount: 0, 
					
					//Color of the Snake segment
					snakeColor: Snake.snakeColor
					
				}
												
			});
			
			//Set the headcolor of the snake
			
			Snake.segments[Snake.segmentCount-1].snakeColor = Snake.headColor;
												
		},
		
		/**  
		  * @desc Initializes the snake at the beginning of a game
		  * @return null 
		  
		*/  			
		
		setupSegments: function(){
			
			//Handle the shake/wiggle of the snake tail when food is eaten
						
			var shakeAmount = 0;	
			var shakeX = 0;
			var shakeY = 0;		
			var dir = "horizontal";
			var shake = false;
			
			//Calculate segment position based upon the 
										
			switch(Snake.heading){										
				
				case "l":													
						Snake.xpos -= Snake.size+Snake.spacing;
						x = Snake.xpos;
						//x = Snake.xpos;
						y = Snake.ypos;
						dir = "horizontal";
												
					break;
				
				case "r":						
					
						Snake.xpos += Snake.size+Snake.spacing;
						x = Snake.xpos;
						y = Snake.ypos;								
						dir = "horizontal";
						
					break;
				
				case "u":																				
						x = Snake.xpos;								
						Snake.ypos -= Snake.size+Snake.spacing;
						y = Snake.ypos;
						dir = "vertical";
						
					break;
				
				case "d":
																										
						x = Snake.xpos;								
						Snake.ypos += Snake.size+Snake.spacing;
						y = Snake.ypos;
						dir = "vertical";
						
					break;
							
			}			
			
			//Set the shake variables off of the tail of the snake before shifting it off the array
			
			shake = Snake.segments[0].shake;			
			shakeAmount = Snake.segments[0].shakeAmount;
			
			Snake.segments.shift();			
			Snake.segments.push({ xpos : x, ypos : y, shake: false, shakeAmount: 0, snakeColor: Snake.snakeColor});
			
			
			//Handle the segment shakr/wiggle if needed
			
			if(shake == true){
				
				Snake.segments[0].shake = shake;				
				Snake.segments[0].shakeAmount = shakeAmount + 1;
				Snake.shaking = true;
								
				if(dir == "horizontal" && Snake.segments[0].shakeAmount%2 == 0){
				
					Snake.segments[0].xpos += Snake.size/2;
					
				}else{
				
					Snake.segments[0].xpos -= Snake.size/2
				
				}
				
				if(dir == "vertical" && shakeAmount%2 == 0){
				
					Snake.segments[0].ypos += Snake.size/2;
					
				}else{
				
					Snake.segments[0].ypos -= Snake.size/2
				
				}
				
				if(shakeAmount >= Snake.shakeAmount){
					Snake.segments[0].shake = false;
					Snake.shaking = false;
				}
			}
						
			
			if(_.size(Snake.segments) < Snake.segmentCount){
				
				start = _.size(Snake.segments);
				end = Snake.segmentCount;
								
				for(key = start; key < end; key++ ){
					Snake.segments.push({ xpos : x, ypos : y, shake: false, shakeAmount: 0, snakeColor: Snake.snakeColor});
				}
				
			}
			
			//Set the color so the new head is the correct color
						
			_.each(Snake.segments, function(value, key){
				Snake.segments[key].snakeColor = Snake.snakeColor;
			});
			
			Snake.segments[Snake.segmentCount-1].snakeColor = Snake.headColor;
			
		},
		
		/**  
		  * @desc Draws the snake segments on the canvas
		  * @return null 
		  
		*/  		
		renderSnake: function(){
		
			_.each(Snake.segments, function(value, key){		
						
				GameSys.context.fillStyle = value.snakeColor;
			    GameSys.context.beginPath();
			    GameSys.context.moveTo(value.xpos, value.ypos);
			    GameSys.context.arc(value.xpos, value.ypos, Snake.size, 0, 2 * Math.PI, false);
				GameSys.context.closePath();
			    GameSys.context.fill();
				
			});			
			
		},
		
		/**  
		  * @desc Sets the snake heading based upon keyboard input
		  * @param int keypress - the Keycode that is passed from a eventHandler
		  * @return null 
		  
		*/ 
		
		controlSnake: function(keypress){						
			
			_.each(controlKeys, function(value, key){
												
				if(value == parseInt(keypress)){
				
					if(GameSys.gameOptions.debug) console.log("Keypress Switch Direction: "+key);
					Snake.heading = key;
					
				}
			
			});
			
		},
		
		
		/**  
		  * @desc Basic collision detection for walls, self, and food
		  * @return null 
		  * @todo the self collision is a little wonky when shaking/wiggling, need to improve upon this
		*/ 
		
		collisionDetect: function(){
			
			//Detect Wall Collision using the 
			
			if (Snake.xpos <= 20 || Snake.ypos <= 20 || Snake.xpos >= (GameSys.canvas.width - 20) || Snake.ypos >= (GameSys.canvas.height - 20)){
				
				if(GameSys.gameOptions.debug)  console.log("Head First into the Wall!");
				Snake.isDead = true;
				
			} 
			
			//Detect Self Collision while taking the shake/wiggle effect into account.
						
			_.each(Snake.segments, function(value, key){

				if(Snake.segments[Snake.segmentCount-1].xpos == value.xpos && Snake.segments[Snake.segmentCount-1].ypos == value.ypos && Snake.shaking === false && key != Snake.segmentCount-1){
					if(GameSys.gameOptions.debug) console.log("Go Eat Yourself!");
					Snake.isDead = true;
				}
				
			});			
			
			//Detect Food Collision based upon the distance of the food, if the collision is detected, then increase score, speed, segments while resetting the food. 
			
			distanceX = Math.abs((Snake.segments[Snake.segmentCount -1].xpos - Food.xpos));// - (Snake.snakeFood.size*2 + Snake.size*2));
			distanceY = Math.abs((Snake.segments[Snake.segmentCount -1].ypos - Food.ypos));// - (Snake.snakeFood.size*2 + Snake.size*2));
		
			
			if(distanceX <= (Food.size/2 + Snake.size) && distanceY <= (Food.size/2 + Snake.size) ){
				
				if(GameSys.gameOptions.debug) console.log("Yummmy Snacks!");
				
				GameSys.score += 20;
				GameSys.gameSpeed += 1;
				Snake.segmentCount++;
				
				//Reset the food
				Food.hasFood = false;
				
				//Toggle segment shake/wiggle.
				Snake.segments[0].shake = true;
			}
		}
	}
	
	
	/**  
	  * @desc Object to contain all of our food object code.
	*/ 	
	
	var Food = {
		
		hasFood: false,
		size: 10*getRatio(),
		xpos: 0,
		ypos: 0,
		padding: 0,
		
		
		/**  
		  * @desc Handles location and rendering of the food object in the game
		  * @return null
		*/ 	
		
		placeFood: function(){

			var x = 0;
			var y = 0;
			
			//If the snake doesn't have food, create some. Otherwise render at current location.
			if(!Food.hasFood){
				
				//Randomize food placement. Distance from the wall is set based upon difficulty level.
				
				
				
				x = Math.floor(Math.random() * GameSys.canvas.width-(40+Food.size));
				y = Math.floor(Math.random() * GameSys.canvas.height-(40+Food.size));
				
				if(x < Food.padding+20+Food.size) x = Food.padding+20;
				if(x > Food.padding+GameSys.canvas.width-(20+Food.size)) x -= Food.padding;
				if(y < Food.padding+20+Food.size) y = Food.padding+20;				
				if(y > Food.padding+GameSys.canvas.height-(20+Food.size)) y -= Food.padding;
				
				
				if(GameSys.gameOptions.debug) console.log("New Food: x: "+x+" y: "+y+" Padding: "+Food.padding);
				
				GameSys.context.fillStyle = Food.foodColor;
			    GameSys.context.beginPath();
			    GameSys.context.moveTo(x, y);
			    GameSys.context.arc(x, y, Food.size, 0, 2 * Math.PI, false);
			    GameSys.context.closePath();
			    GameSys.context.fill();
			    
			    Food.xpos = x;
			    Food.ypos = y;
			    
			    Food.hasFood = true;
				
				
			}else{
				
				x = Food.xpos;
				y = Food.ypos;
				
				GameSys.context.fillStyle = Food.foodColor;
			    GameSys.context.beginPath();
			    GameSys.context.moveTo(x, y);
			    GameSys.context.arc(x, y, Food.size, 0, 2 * Math.PI, false);
			    GameSys.context.closePath();
			    GameSys.context.fill();
				
				
			}
			
		}
		
	}
	
	
	/**  
	  * @desc Utility function to return a pixel density ratio based upon various device criteria, three different levels of rendering
	  * @return null
	*/ 	
	
	function getRatio(){
		
		var ratio = 1;
			
		if((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3)){		
			ratio = 1.3;
		}		

		if((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 2)){			
			ratio = 2;			
		}
		
		return ratio;
	}
	  	
	/**  
	  * @desc Utility function to return a pixel density ratio based upon various device criteria, three different levels of rendering
	  * @param object options - contains the default options for the game set at the command line
	  * @return null
	*/ 		
	function startGnarlySnake(options){
					
		if(GameSys.gameOptions.debug) console.log("Starting Gnarly Snake....\nGame Options Set:");
		
		//Set the options provided when the javascript is initiated	
		_.each(options, function(value, key){
			
			if(GameSys.gameOptions.debug) console.log("   "+key+": "+value);
			GameSys.gameOptions[key] = value;
			
		});	
		
		//Set the default game settings of themes and difficulty
		
		var gameDefaults = {
		
			themes: {
				
				lava : {
					bgColor : "#000000",
					wallColor : "#FF9900",
					snakeColor : "#FF0000",
					headColor: "#FFFFFF",
					foodColor: "#D6BE7C",
					textColor: "#FFFFFF"
				},
				
				natural : {
					bgColor : "#AEC493",
					wallColor : "#54693B",
					snakeColor : "#4B735D",
					headColor: "#FFFFFF",
					foodColor: "#786032",
					textColor: "#000000"
				},
								
				monochrome : {
					bgColor : "#000000",
					wallColor : "#FFFFFF",
					snakeColor : "#FFFFFF",
					headColor: "#FFFFFF",
					foodColor: "#FFFFFF",
					textColor: "#FFFFFF"
				}
					
			},
		
			levels: {
		
				sissy: {
					gameSpeed : 15,
					wallPadding : 100,
				},
				
				manly: {
					gameSpeed : 25,
					wallPadding : 30,
				},
				
				metalcore:{
					gameSpeed : 45,
					wallPadding : 0,
				}
							
			}
		}
		
		_.extend(GameSys, gameDefaults);
		
		
		//Start the Snake Party!
		
		//GameSys.setGameSize();
		GameSys.resetDefaults();
		GameSys.setupCanvas();
		MenuSys.currentMenu = "main";
		MenuSys.initMenu();
									
	}
	
    return {
      
      startGame:function(options){
	      startGnarlySnake(options);
      }
 
    };
 
  };
 
  return {
 
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
 
      if ( !SnakeGame ) {
        SnakeGame = init();
      }
 
      return SnakeGame;
    }
 
  };
 
})();

$(document).ready(function(){

	var SnakeGame = gnarlySnake.getInstance();
	
	var options = 
	{
		debug : true,
		theme: "monochrome",
		difficulty: "sissy",
		imgDir: "img/",
	
	}
	
	SnakeGame.startGame(options);
	
});