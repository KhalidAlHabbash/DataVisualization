Indicate any sources of inspiration, including any specific D3 code blocks that you consulted or built upon. Explain what changes you made and their magnitude (e.g. unchanged vs. minor tweaks vs. major functionality additions) for any code that you built upon.

A lot of the code framework was done in assistance by using the AI tool: chatGPT. It was used extensively to format, comment, create small helper functions and come up with code structures that we built upon. For example, updateDatesCallback and updateFromTimeline were done by using chatGPT. It was also used extensively to create tooltips and legend information for all of the visualizations. The code derived from chatGPT was used as a foundation but a lot of modification had to be made to make it work for our visualizations as it was not reliable. In the majority of instances, it served as a guideline on how to approach and structure code that we used as a skeleton. We wanted to build the code following the structures set out in the previous tutorial so major modifications were made. It was also used to debug problems from the console as it would point us in the right direction on what is the root cause of the issue. 

Slider functionality is built upon a framework from here https://github.com/johnwalley/d3-simple-slider. As you can see there was a lot of modifications and tweaking required in terms of styling the handlebars and the track to fit our requirement. There were major functionality additions since the slider from the package is very barebones. 

A lot of small bugs/issues were resolved by looking up Stack Overflow posts. Most of the changes from here were minor. 

The heatmap motion is inspired from here https://www.youtube.com/watch?v=T81Fb1hrToA. We wanted to replicate the appeal of a ball travelling to the net and showcase all that in one view. It makes the visualization look more appealing and also shows just how prolific Ronaldo was at scoring goals. 


