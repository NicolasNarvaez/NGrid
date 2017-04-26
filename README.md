# NGrid
The only 4-dimensional, fast, psychedelic, neon-like game in the web! (or 3D if you dont go well with 4D).

You can try a demo [here](http://www.ngrid.cl)

Download the software and open index.html in your (updated) browser of choice, remember to keep pressed right-click if you want to change the view-rotation axis.

Simple instructions: view rotation in 4D is 3-Dimensional(because of a view volume: horizontal, vertical, frontal), contrary to 3D view-rotation being 2-Dimensional (because of a view plane: horizontal, vertical).

What i did to solve this in terms of user interaction, was connect y-axis of mouse to y-axis of 4D view volume, x-axis of mouse to x-axis of 4D view volume, and when you keep right-click pressed, x-axis is connected to z-axis of 4D view volume.

Currently, the 4D view is working, with multiple projection configurations (perspective, orthogonal) and camera dispositions (simetrical, frontal), and view-rotation configurations (relative, global). The next thing is adding some simple collision and physics calculations to create the first play-tests *o*.
