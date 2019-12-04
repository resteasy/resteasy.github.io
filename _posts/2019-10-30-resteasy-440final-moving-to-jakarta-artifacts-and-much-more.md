---
layout:     post
title:      "RESTEasy 4.4.0.Final: moving to Jakarta artifacts and much more"
subtitle:   ""
date:       2019-10-30 8:07:00
author:     "Alessio Soldano"
---
Just before Halloween, here is another nice release of **RESTEasy**!

The [new
version](https://issues.jboss.org/secure/ReleaseNote.jspa?projectId=12310560&version=12342767&styleName=Text)
comes with:

-   a bunch of new features in the Spring Web integration area
-   many enhancements, mainly aiming at improving performances
-   a lot of component upgrades, to pull in the latest / greatest
    available dependencies
-   some important bug fixes (including one for a potential memory leak
    in the Reactor Netty client integration)

In addition to that, **RESTEasy 4.4.0.Final** is the first version
relying directly or indirectly on **Jakarta EE** API artifacts. We\'ve
been replacing all JavaEE API dependencies with the corresponding
Jakarta EE 8 ones, while moving to new major versions of JBoss spec API
artifacts (now forked from Jakarta EE APIs). This basically followed the
same approach we used in
[WildFly](https://wildfly.org/){.jive-link-external-small} (read more
from Brian
[here](https://wildfly.org/news/2019/10/03/WildFly18-Final-Released/#alignment){.jive-link-external-small},
if interested).

 
The 4.4.0.Final release artifacts are available on Maven Central and
JBoss Nexus repositories as usual and the distribution can also be
downloaded at <https://resteasy.github.io/>.


Finally, [Quarkus 0.27 has just been
released](https://quarkus.io/blog/quarkus-0-27-0-released/){.jive-link-external-small}
too, and it includes RESTEasy 4.4.0.Final\... time to give it a try ;-)

Feedback is welcome as usual!

Enjoy!
