---
layout:     post
title:       "How to use RESTEasy in a Spring Boot application"
subtitle:   ""
date:       Aug 9, 2017 2:01:33 PM 
author:     Fábio Carvalho
---


                    



                    





**Spring Boot**


 

[Spring Boot](http://projects.spring.io/spring-boot/) is Spring &#34;convention-over-configuration&#34; solution for creating stand-alone, production-grade Spring-based Applications, usually contained in a single and executable jar. It is also an opinionated framework, allowing Spring platform and third-party libraries to be auto-configured, minimizing the need for boilerplate code.

 

One of the most important concepts in Spring Boot is the notion of &#34;starter&#34;. According to [Spring Boot reference guide](http://docs.spring.io/spring-boot/docs/1.5.3.RELEASE/reference/htmlsingle/#using-boot-starter), _&#34;starters are a set of convenient dependency descriptors that you can include in your application&#34;_. Another way to see starters is as _&#34;the building blocks that leverage auto-configuration when extending your application with Spring or other third-party components&#34;_.

 

Because of all features Spring Boot offers, it ends up being a very convenient platform to build Java [microservices](https://www.thoughtworks.com/insights/blog/microservices-nutshell) applications, especially considering that Spring Boot has also starters for embedded Servlet containers, such as Tomcat and Jetty.

 


**RESTEasy and Spring Boot**


 

When it comes to JAX-RS applications, Spring Boot applications can also be RESTEasy applications, and that is possible by using [RESTEasy Spring Boot starter](https://github.com/paypal/resteasy-spring-boot/), which is an open source project initially developed by PayPal, and endorsed by RESTEasy team.

 


**Using RESTEasy in a Spring Boot application**


 

Using RESTEasy in a Spring Boot application is very simple, just follow the steps below.

1.  Add dependency 
**`com.paypal.springboot:resteasy-spring-boot-starter`**
 to your Spring Boot application (it is recommended to use [the latest version](http://search.maven.org/#search%7Cga%7C1%7Cg:com.paypal.springboot)).
2.  Optionally, register one or more [JAX-RS Application classes](https://docs.oracle.com/javaee/6/api/javax/ws/rs/core/Application.html). To do so, just define it as a Spring bean, and it will be automatically registered.
3.  Finally, to register JAX-RS resources and providers, just define them as Spring beans, and they will be automatically registered.

 

Notice that JAX-RS resources can be singleton or request scoped, while JAX-RS providers must be singletons.

 

See this [RESTEasy Spring Boot sample application](https://github.com/paypal/resteasy-spring-boot/tree/master/sample-app) as an example.

 


**References**


 

1.  [RESTEasy Spring Boot Starter](https://github.com/paypal/resteasy-spring-boot/)
2.  [Spring Boot](http://projects.spring.io/spring-boot/)
3.  [Spring Framework - Wikipedia](https://en.wikipedia.org/wiki/Spring_Framework#Spring_Boot)
4.  [Spring Boot Reference Guide](http://docs.spring.io/spring-boot/docs/1.5.3.RELEASE/reference/htmlsingle/#using-boot-starter)
5.  [Spring Initializr](http://start.spring.io/)
6.  [Microservices in a Nutshell](https://www.thoughtworks.com/insights/blog/microservices-nutshell)



                    




                    

                    


                
