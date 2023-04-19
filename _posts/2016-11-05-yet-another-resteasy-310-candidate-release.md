---
layout:     post
title:       "Yet another RESTEasy 3.1.0 candidate release..."
subtitle:   ""
date:       Nov 5, 2016 9:56:00 AM 
author:     Alessio Soldano
---


                    



                    




Last month I was writing about RESTEasy 3.1.0.CR2 and telling you we would have gone Final soon... actually we had to work on a major refactoring on the project that led to creating another candidate release. It turned out that the old API cleanup that went into 3.1.0.Beta2 as part of [RESTEASY-1363](https://issues.redhat.com/browse/RESTEASY-1363) would have effectively prevented us from bundling RESTEasy in any JBoss EAP 7.x series future release. Here I&#39;m not going through the details of the container rules regarding backward compatibility; what really matters is that we decided to go with a slightly milder solution, restoring the previously removed stuff into an optional and deprecated module of the project, resteasy-legacy. Besides granting us a way to comply with EAP 7.x requirements, the dependency to the new module is going to offer a chance of running on RESTEasy 3.1 to those who didn&#39;t fully move on from RESTEasy 2 APIs and the other old deprecated functionalities. An updated version of the migration guides is being prepared and will be available hopefully soon; in the mean time you can start playing with RESTEasy 3.1.0.CR3 bits. The Nexus Maven repository already has the 3.1.0.CR3 artifacts, which are also already pulled by latest WildFly master.

The actual release notes are [here](https://issues.redhat.com/secure/ReleaseNote.jspa?version=12331660&amp;styleName=Text&amp;projectId=12310560&amp;Create=Create); any feedback, just let us know :-)

Cheers

Alessio




                    




                    

                    


                
