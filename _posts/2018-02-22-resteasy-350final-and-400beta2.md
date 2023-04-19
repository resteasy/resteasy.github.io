---
layout:     post
title:       "RESTEasy 3.5.0.Final and 4.0.0.Beta2"
subtitle:   ""
date:       Feb 22, 2018 5:44:00 PM
author:     Alessio Soldano
---


                    



                    




Three months after previous announcement, here we are with _another step towards RESTEasy 4_! Among the achievements in **4.0.0.Beta2** version we have:

*   completed JAX-RS 2.1 (JSR 370) implementation
*   [Microprofile REST Client 1.0 implementation](https://issues.jboss.org/browse/RESTEASY-1795)
*   Multiple performance improvements
*   [Upgrade to JAXB 2.3](https://issues.jboss.org/browse/RESTEASY-1796)

The full release notes are available on [jira](https://issues.jboss.org/secure/ReleaseNote.jspa?version=12336052&amp;styleName=Text&amp;projectId=12310560&amp;Create=Create), the artifacts are built and published on [Maven repositories](https://repo1.maven.org/maven2/org/jboss/resteasy/resteasy-jaxrs-all/4.0.0.Beta2/) and the sources are on [GitHub](https://github.com/resteasy/resteasy/tree/4.0.0.Beta2) as usual ;-)

 

To align with the [WildFly](https://wildfly.org/) roadmap and increase adoption, during the last month the team has worked hard on backporting most of the new features and all bug fixes contributed so far on master to a new dev stream forked from the 3.0.x branch. The result is today&#39;s release of **RESTEasy 3.5.0.Final**, which is helping WildFly on the road to _Java EE 8_ compliance by providing **JAX-RS 2.1** implementation while ensuring _full backward compatibility_ with the RESTEasy versions it previously shipped with.

RESTEasy 3.5.0.Final basically allows easy access to the [4.0.0.Beta1](https://developer.jboss.org/community/resteasy/blog/2017/11/13/resteasy-400beta1) / 4.0.0.Beta2 stable features by offering a painless upgrade path to the 3.0.x users.

The natural upgrade path for users already on RESTEasy 3.1 series is straight to RESTEasy 4.0.0.Beta2 instead.

 

RESTEasy 3.5.0.Final binaries and sources are available on [resteasy.jboss.org](https://resteasy.jboss.org/), together with the official [documentation](https://docs.jboss.org/resteasy/docs/3.5.0.Final/userguide/html/index.html). Release notes on [jira](https://issues.jboss.org/issues/?jql=project%20%3D%20RESTEASY%20AND%20fixVersion%20in%20(3.5.0.CR1%2C%203.5.0.Final)%20ORDER%20BY%20fixVersion%20DESC%2C%20type%20DESC) and Maven artifacts on the [repository](https://repo1.maven.org/maven2/org/jboss/resteasy/resteasy-jaxrs-all/3.5.0.Final/), as usual.

Please consider trying the latest release and providing feedback!

Enjoy :-)




                    




                    

                    


                
