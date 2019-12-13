---
layout:     post
title:       "On the road to RESTEasy 3.1.0 release..."
subtitle:   ""
date:       Sep 13, 2016 12:06:00 P
author:     Alessio Soldano
---

As you might have noticed on [github](https://github.com/resteasy/Resteasy), the team has been quite active on master during last months; after almost twenty 3.0.x bug fix releases, we&#39;re eventually working on a new minor, 3.1.0.

Among the most relevant changes that are coming in the new minor there are default Java 8 target, revisited project structure / testsuite and a major cleanup of old and deprecated APIs. On the last topic, Ron has been preparing a very good [document](http://docs.jboss.org/resteasy/docs/resteasy-upgrade-guide-en-US.pdf) you might want to read for easy migration of old (RESTEasy 2.3 style) code.

Clearly, bug fixes and new features are coming too in 3.1.0! We&#39;re trying to deal with as much pull requests as possible (keep sending them, thanks!) and one that I&#39;d like to mention here is from Julien Viet who [contributed](https://github.com/resteasy/Resteasy/pull/868) a new server adapter for [Vert.x](http://vertx.io/) [integration](https://issues.jboss.org/browse/RESTEASY-1453).

We&#39;ve tagged two 3.1.0 Beta releases so far, both available as artifacts on Maven repository. I&#39;m currently waiting for the last one to be merged into WildFly master (PR [here](https://github.com/wildfly/wildfly/pull/9181)).

If you have some time, consider early checking your projects with the new 3.1.0 and feel free to report back any issue (btw, as a reminder, note we have [new mailing lists](http://resteasy.jboss.org/mailinglists) since some months!). We plan to go CR soon and hopefully release at before the end of October.

Stay tuned :-)




                    




                    

                    


                
