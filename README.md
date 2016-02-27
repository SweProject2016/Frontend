Frontend
--------

This is the repository that contains the whole frontend web-interface for the CBR-System.

This interface is the be designed by the guidelines described and the mockups shown in the SRS-document.

##### Mockups:

![Main App](http://i.imgur.com/h9d4lQy.png)
![Result Screen](http://i.imgur.com/bpLCVQd.png)
![SideNav](http://i.imgur.com/38gGfpe.png)

If you cant see the above pictures, follow this:

http://imgur.com/a/K6Y8n


Installation
------------

Once your cloned the repository, you are pretty much good to go.
But if you have bower installed, it is advised to first run

    $ bower update

to update the dependencies. Then simply use the Webserver of your choice to deliver the files.

TODO
----

- Collapse result on button clicked
- Implement Settings option in the sidenav
- Implement Login functionality (could be just basic api and access token setting)
- Implement back-POST for the rate result functionality
- Footer with links to HWR Facebook, Homepage and copyright etc.
- Update Result box with all the given information
- Change all console.logs to something more appropriate, where the log level can be set
