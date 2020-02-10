---
layout:     post
title:      "RESTEasy default white-list based PolymorphicTypeValidator extension"
subtitle:   ""
date:       Feb 11, 2020 01:00:00
author:     Alessio Soldano
---
I've been planning to write about the topic here since quite some time, apologize for the delay...

A few months ago, when RESTEasy 4.4.2.Final and 3.9.3.Final have been released, you might have noticed that the **Jackson 2** dependency has been updated to **2.10.x series** and [a default white-list based PolymorphicTypeValidator extension](https://issues.redhat.com/browse/RESTEASY-2411) has been provided. OK, so, what's that and what is it really meant to be used for?

The changes have to do with CVEs and aim at **making applications relying on RESTEasy more secure by default**. The topic is quite complex and assessing whether a REST application is vulnerable is not straightforward, so for a proper understanding of the problem I really recommend reading the following two articles from the Jackson lead: [On Jackson CVEs: Don’t Panic — Here is what you need to know](https://medium.com/@cowtowncoder/on-jackson-cves-dont-panic-here-is-what-you-need-to-know-54cd0d6e8062) and [Jackson 2.10: Safe Default Typing](https://medium.com/@cowtowncoder/jackson-2-10-safe-default-typing-2d018f0ce2ba)

Now, to be on the safe side, in RESTEasy we decided to **always enable Safe Default Typing**, by installing a **custom PolymorphicTypeValidator** instance that relies on system properties for creating a **white-list** of classes that are allowed to be deserialized. Most of the applications won't simply be affected by this; however, if your scenario is one of those allowing for the vulnerability to be exploited, you'll most likely have to provide a suitable white-list of classes to ensure our application keep on working properly.
You can read more (including the actual system properties' names) in the [RESTEasy documentation](https://docs.jboss.org/resteasy/docs/4.4.2.Final/userguide/html/json.html#Polymorphic_Typing_deserialization). On RESTEasy 4 series, the properties can also be specified at deployment level using MicroProfile Config.
                
