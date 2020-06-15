---
layout:     post
title:      "MicroProfile Config 1.3; Examination of The Out-Of-The-Box
ConfigSources for a RESTEasy Application"
subtitle:   ""
date:       Jun 14, 2020 
author:     Rebecca Searls
---

In this article we will examine the out-of-the-box ConfigSources the MicroProfile 
Configuration specification mandates every implementor provide and the three
ConfigSources RESTEasy provides for each servlet and filter. I will show how these
ConfigSources are used to customize the configuration of a simple REST
application that runs in Wildlfy, and discuss some of the nuances in their use.

I have created a REST application whose endpoints use MicroProfile-Configuration's
APIs to retrieve the information WildFly's implementation of this specification provides.
[SmallRye Config](https://smallrye.io/) is WildFly's implementation of 
[Eclipse MicroProfile Config](https://github.com/eclipse/microprofile-config/).


### Requriements
* Source code: [microprofile-config-outOfBox](https://github.com/rsearls/blog-posts)
* WildFly 19 or newer
* maven
* JDK 1.8 or newer
> Note
>````
>I am using a unix environment.  This has not been tested on Windows.
>I will be running WildFly and executing cURL commands in a terminal 
>window.
>````

The source code for this blog creates four nearly identical WAR files.
Each WAR file has a small addition which will show different ConfigSources.
This allows me to show you how an addition to an archive affects 
the set of ConfigSources provided and how configuration properties set 
externally are handled. WAR file microprofile-config-one.war in project 
module one uses only the minimal set of configuration options.  Module two
adds a microprofile-config.properties file to the base application.
Module three adds a third party JAR containing a microprofile-config.properties
file.  Module four uses a web.xml for configuration and adds two filters to
the application.

### Resource Class
Here is the skeleton of the REST resource that is used in this discussion. 
I will leave it to the reader to look at the class source code.
For clarity in calling the different WAR files, the value of @Path on class
DemoResource is the project module name, for module one, it is one, for 
module two, it is two, ... etc.

````
@Path("/one")
public class DemoResource {

    @GET
    @Path("/provider/list")
    public String getProviderList() { 
        // list all registered ConfigProviders by name and ordinal
    }
    
    @GET
    @Path("/report")
    public String resport() {
        // Display just the set of RESTEasy ConfigSources and their contents.
    }

    @GET
    @Path("/{source}/properties/")
    public String getProviderProperties( @PathParam("source") String source) {
        // For the specified (ConfigSource) source, list all the properties 
        // (key/value).
    }
    
    @GET
    @Path("/lookup/{key}")
    public String getKeyValue ( @PathParam("key") String key) {
        // List each ConfigSource containing the property key 
    }
    
    @GET
    @Path("/get/{key}")
    public String getValue ( @PathParam("key") String key) {
        // Return the value of the property (key) the system selects
        // to be used.
    }
}
````

I suggest you build and deploy the applications, so you can call the endpoints
as I do and see the output, however I will list the output here as well.

#### Build and Deploy
```
mvn clean package
``` 
```
cp ./one/target/microprofile-config-one.war ${WILDFLY_HOME}/standalone/deployments/.
cp ./two/target/microprofile-config-two.war ${WILDFLY_HOME}/standalone/deployments/.
cp ./three/target/microprofile-config-three.war ${WILDFLY_HOME}/standalone/deployments/.
cp ./four/target/microprofile-config-four.war ${WILDFLY_HOME}/standalone/deployments/.
${WILDFLY_HOME}/bin/standalone.sh
``` 

### Base set of ConfigSources, microprofile-config-one.war

Lets look at the out-of-the-box set of ConfigSources provided
by SmallRye and RESTEasy for a REST application.

````
curl http://localhost:8080/microprofile-config-one/one/provider/list

Ordinal   Name
400   SysPropConfigSource
300   EnvConfigSource
60   null:null:ServletConfigSource
50   null:null:FilterConfigSource
40   null:ServletContextConfigSource
````

The specification requires that each ConfigSource instance provide a name and 
an ordinal.  The ordinal designates the priority of the ConfigSource. Higher 
ordinals have priority over lower ordinals. Properties in higher priority 
ConfigSources take precedence over properties in lower
priority ConfigSources.

> Side Note
>````
>What is the highest possible ordinal?  
>
>It is Integer.MAX_VALUE, 2147483647. Registering a ConfigSource with ordinal
>2147483647 will always be the top of the priority list, however this would 
>not be "best practice". It would likely break something and cause your
>colleagues to yell WTF or worse.
>````

>````
>What happens if I set my ConfigSource ordinal to (Integer.MAX_VALUE + 1)? 
> 
>A java.lang.NumberFormatException will be thrown.
>````

>````
>Which ConfigSource takes precedence if 2 or more have the same ordinal?
>
>It is indeterminate.  The specification makes no statement about it.
>This is not an issue until there is a name collision of a property name.
>The first encountered name in the list of ConfigSources takes precedence.
>````

>```` 
>Be aware the specification allows implementors to assign different ordinals for 
>SysPropConfigSource, EnvConfigSource and PropertiesConfigSource.  Other implementors
>may use different values.
>````

>

There is no required format for ConfigSource names. 
SmallRye chooses to use the class name.  RESTEasy uses a naming pattern.

> Side Note
>````
>As of this writing there is an implementation issue being addressed for
>RESTEsay ConfigSource names.  The pattern is as follows. 
>The first "null" will be the "display-name" declared within element
>"web-app" in the web.xml.  When no "display-name" is declared the
>text "unnamed" will be used.  The second "null" is the "servlet-name"
>for ServletConfigSources and "filter-name" for FilterConfigSource.
>If no name is found "unnamed" will be used.
>````

The first 2 ConfigSources, SysPropConfigSource and EnvConfigSource are required
by the specification. SysPropConfigSource is for retrieving system properties. Its ordinal 
is 400.  EnvConfigSource is for retrieving Environment variables.  Its ordinal is 300.

There is a third ConfigSource required by the specification not seen in this 
list.  It is a ConfigSource for a microprofile-config.properties file.  In
SmallRye its class name is PropertiesConfigSource.  Its default ordinal is 100.
We will look at that one in module two.

The next 3 ConfigSources, ServletConfigSource, FilterConfigSource and
ServletContextConfigSource are RESTEasy specific.  They represent the
three areas in a REST application in which RESTEasy supports external configuration,
servlet declarations, filter declarations and application "context-param" declarations 
respectively.  RESTEasy assigns these ConfigSources low ordinals, 60, 50, and 40.  
   
An instance of each of these three ConfigSources
is always assigned to a running servlet.  When there is no configuration data
for one of these ConfigSources, the instance is present but empty.

> Side Note
>````
>The Servlet specification does not define an order of precedence among these three
>elements.  It defines three classes that implementations use to access the data in
>these elements.  This means there is no chance of confusion when there are duplicate
>"param-names" declared in any of these elements. This is not true for
>MicroProfile Configuration particularly when handling legacy EE applications.  For
>RESTEasy there is some potential for "param-name" collision between servlet, filter
>and context elements.
>````



#### Inspect ConfigSources Contents 
I will leave it to the reader to print the property list for SysPropConfigSource 
and EnvConfigSource because the output for each is 100+ lines.  Here are the
cURL commands for that.

````
curl http://localhost:8080/microprofile-config-one/one/SysPropConfigSource/properties
curl http://localhost:8080/microprofile-config-one/one/EnvConfigSource/properties
```` 

>Historical Note
>````
>When the Servlet specification was created one of the objectives was to define
>a mechanism to declare the specific configuration requirements of the application
>external to the source code, thus making it easier for the programmer to modify
>configuration settings. Web.xml is the result of that effort. The
>MicroProfile Configuration specification is a new layer of externalization
>of configuration data from the code and web.xml.
>````

microprofile-config-one.war is a simple REST application.
The web.xml is empty; no configuration data is provided there.  The application
runs with all the default configuration settings.  Lets see what those are.


````
curl http://localhost:8080/microprofile-config-one/one/report

Ordinal   Name
60   null:org.jboss.rest.config.one.ServiceActivator:ServletConfigSource
	 resteasy.servlet.mapping.prefix : /
	 javax.ws.rs.Application : org.jboss.rest.config.one.ServiceActivator
50   null:null:FilterConfigSource
	 no entries
40   null:ServletContextConfigSource
	 resteasy.preferJacksonOverJsonB : false
	 resteasy.scanned.resources : org.jboss.rest.config.one.DemoResource
	 resteasy.document.expand.entity.references : false
	 resteasy.unwrapped.exceptions : javax.ejb.EJBException
````
This is the minimum set of configuration data RESTEasy requires.  All the properties
which start with "resteasy." are [RESTEasy configuration switches](https://docs.jboss.org/resteasy/docs/3.12.1.Final/userguide/html/Installation_Configuration.html#configuration_switches).
No configuration data is declared in the web.xml for this applications.  These
settings were added by WildFly during the deployment process.  Notice property
javax.ws.rs.Application in ServletConfigSource.  It's not a RESTEasy switch.
RESTEasy will not perform a (configuration) lookup for it.  For all
intents and purposes it is a ready-only value.  There is no filter in the
application, so FilterConfigSource is empty.

According to MicroProfile Configuration rules I should be able to declare a higher precedent
property for any of the properties in the RESTEasy ConfigSources.  Lets test it out.

I'm picking property resteasy.preferJacksonOverJsonB to change because
it will not impact the running of this application.

````
Stop WildFly running.

In the terminal window where WildFly was running define the environment variable.
export resteasy.preferJacksonOverJsonB=TRUE
````
Well that didn't work.  Unix Bash does not allow the "." character in
the property key.  Execution of the command reports error, "not a valid identifier".
 
Moving on to testing with a system variable.  On the command line to
run WildFly add this, -Dresteasy.preferJacksonOverJsonB=TRUE

````
./bin/standalone.sh  -Dresteasy.preferJacksonOverJsonB=TRUE
````

I expect to see property resteasy.preferJacksonOverJsonB=TRUE in SysPropConfigSource 
and resteasy.preferJacksonOverJsonB=false in ServletContextConfigSource.

````
curl http://localhost:8080/microprofile-config-one/one/lookup/resteasy.preferJacksonOverJsonB

Ordinal   Name
400   SysPropConfigSource
	 resteasy.preferJacksonOverJsonB : TRUE
40   null:ServletContextConfigSource
	 resteasy.preferJacksonOverJsonB : TRUE
````
Hmmm.  The property in SysPropConfigSource is expected.
The value of resteasy.preferJacksonOverJsonB in ServletContextConfigSource is
not.  Turns out WildFly checks the system properties for some 
(but not all) of RESTEasy's switches during the deployment process.  In this
case the value is set before ServletContextConfigSource references it.

I'll try this again later with a more conventional property.

 
Before we continue, remove the system variable from WildFly's command line.
````
Stop WildFly
./bin/standalone.sh
````
 
### microprofile-config.properties file, microprofile-config-two.war
Project module two adds microprofile-config.properties to the
archive.  The file contains a single property statement,
"resteasy.preferJacksonOverJsonB=TruE".  We will investigate how this changes 
the list of ConfigSources and affects the property value selected.


Lets check the application list of ConfigSources.
````
curl http://localhost:8080/microprofile-config-two/two/provider/list

Ordinal   Name
400   SysPropConfigSource
300   EnvConfigSource
100   PropertiesConfigSource[source=vfs:/content/microprofile-config-two.war/WEB-INF/classes/META-INF/microprofile-config.properties]
60   null:null:ServletConfigSource
50   null:null:FilterConfigSource
40   null:ServletContextConfigSource
````
SmallRye created a PropertiesConfigSource instance for microprofile-config.properties.
The PropertiesConfigSource checks two locations
in an archive for this file, META-INF/microprofile-config.properties
and WEB-INF/classes/META-INF/microprofile-config.properties.  SmallRye provides
as part of its ConfigSource's name the path to the file.

The default ordinal for any microprofile-config.properties is 100. 
The file's ordinal can be changed with the addition of property,
config_ordinal, (e.g. config_ordinal=95).  An example of this will
be shown later.

Here are the ConfigSources that contain property, resteasy.preferJacksonOverJsonB
````
curl http://localhost:8080/microprofile-config-two/two/lookup/resteasy.preferJacksonOverJsonB

Ordinal   Name
100   PropertiesConfigSource[source=vfs:/content/microprofile-config-two.war/WEB-INF/classes/META-INF/microprofile-config.properties]
	 resteasy.preferJacksonOverJsonB : TruE
40   null:ServletContextConfigSource
	 resteasy.preferJacksonOverJsonB : false

````

Here is the value that will be returned when RESTEasy requests the property.
````
curl http://localhost:8080/microprofile-config-two/two/get/resteasy.preferJacksonOverJsonB

TruE
````
This is the expected value.  PropertiesConfigSource has a higher ordinal than
ServletContextConfigSource, hence it is found first.
The key is found and its value returned to the caller.



### Multiple microprofile-config.properties files, microprofile-config-three.war

Module three builds upon the contents of module two.  It add a third party
JAR file, childJar.JAR, to the archive.  childJar only contains a 
microprofile-config.properties file with property, "resteasy.preferJacksonOverJsonB=MayBe"

>Note
>````
>The specification states "an ..  implementation must provide ... A
>ConfigSource for each property file META-INF/microprofile-config.properties
>found on the classpath."
>````

Lets confirm that a PropertiesConfigSource instance
is provided for each microprofile-config.properties file found
in its classpath. 

````
curl http://localhost:8080/microprofile-config-three/three/provider/list

Ordinal   Name
400   SysPropConfigSource
300   EnvConfigSource
100   PropertiesConfigSource[source=vfs:/content/microprofile-config-three.war/WEB-INF/lib/childJar-1.0.jar/META-INF/microprofile-config.properties]
100   PropertiesConfigSource[source=vfs:/content/microprofile-config-three.war/WEB-INF/classes/META-INF/microprofile-config.properties]
60   null:null:ServletConfigSource
50   null:null:FilterConfigSource
40   null:ServletContextConfigSource
````
Great, that's true.  There is a PropertiesConfigSource for
both childJar's META-INF/microprofile-config.properties and microprofile-config-three's
META-INF/microprofile-config.properties file.  

Both ConfigSources have the default ordinal, 100.  Remember there is no
guarantee which order ConfigSources of the same ordinal will reside in the
list.  In this case childJar's ConfigSource is first.  Property, 
"resteasy.preferJacksonOverJsonB=MayBe", will win out over microprofile-config-three's
setting and ServletContextConfigSource's setting.

If you want to see the list of ConfigSources that contain property resteasy.preferJacksonOverJsonB
run this command
````
curl http://localhost:8080/microprofile-config-three/three/lookup/resteasy.preferJacksonOverJsonB
````

Just for completeness lets confirm that the property value for the first 
PropertiesConfigSource in the list is returned.
````
curl http://localhost:8080/microprofile-config-three/three/get/resteasy.preferJacksonOverJsonB

MayBe
````
Yes, it is.

### App Configuration with web.xml, microprofile-config-four.war

microprofile-config-four.war is a more complex application.  The configuration
data is moved into the web.xml. This application has a servlet and two filters.
Servlet, DemoFour, uses filter, Farewell-Filter, to append text, "Thanks for asking"
to each response.  Filter, Air-Filter, simply defines a different URL to retrieve
our data.  microprofile-config.properties has two properties.  The first will
set the PropertiesConfigSource's ordinal to 53.  The second changes the farewell 
message to "that's all folks".
 
Lets look at the properties for servlet DemoFour. 
````
curl http://localhost:8080/microprofile-config-four/four/report

Ordinal   Name
60   null:DemoFour:ServletConfigSource
	 javax.ws.rs.Application : org.jboss.rest.config.one.ServiceActivator
53   PropertiesConfigSource[source=vfs:/content/microprofile-config-four.war/WEB-INF/classes/META-INF/microprofile-config.properties]
	 config_ordinal : 53
	 farewell-phrase : that's all folks
50   null:null:FilterConfigSource
	 no entries
40   null:ServletContextConfigSource
	 resteasy.preferJacksonOverJsonB : false
	 month : June
	 courts : legal-courts
	 resteasy.document.expand.entity.references : false
	 resteasy.unwrapped.exceptions : javax.ejb.EJBException

-- Thanks for asking --
````
All the expected ConfigSources are present. PropertiesConfigSource is in its
appropriate location for its ordinal value.  Why is FilterConfigSource empty?
Shouldn't it have property, "farewell-phrase=Thanks for asking"?  Farewell-Filter
is not functioning as a servlet but as a filter class for servlet DemoFour, so
its configuration data will not be listed in a FilterConfigSource.  Why isn't
Farewell-Filter using the farewell message provided in PropertiesConfigSource?
Traditionally, (i.e. as defined in the Servlet specification), a filter gets its
configuration data by calling FilterConfig's getInitParameter and
getInitParameterNames methods.  I would need to change the code to use
MicroProfile Configuration's API to get the value from the ConfigSources.
Easily done.  I just chose to go old-school here.  


Lets look at the properties for filter Air-Filter.
````
curl http://localhost:8080/microprofile-config-four/air/four/report

Ordinal   Name
60   null:DemoFour:ServletConfigSource
	 no entries
53   PropertiesConfigSource[source=vfs:/content/microprofile-config-four.war/WEB-INF/classes/META-INF/microprofile-config.properties]
	 config_ordinal : 53
	 farewell-phrase : that's all folks
50   null:null:FilterConfigSource
	 resteasy.servlet.mapping.prefix : /air
	 javax.ws.rs.Application : org.jboss.rest.config.one.ServiceActivator
	 aquarium : fish-filter
40   null:ServletContextConfigSource
	 resteasy.preferJacksonOverJsonB : false
	 month : June
	 courts : legal-courts
	 resteasy.document.expand.entity.references : false
	 resteasy.unwrapped.exceptions : javax.ejb.EJBException

````
FilterConfigSource does contain configuration data and notice ServletConfigSource
is empty.  In RESTEasy one or the other of these ConfigSources will contain
data but not both at the same time.


Lets run one last test.  I want to set a system variable and environment
variable for filter parameter, aquarium, to show the properties are registered
in ConfigSources, SysPropConfigSource and EnvConfigSource.

Stop WildFly.  
Set the environment variable.
````
export aquarium="tank equipment"
````
Start WildFly using a system variable.
````
./bin/standalone.sh -Daquarium="Tropical Pets"
````

Check for the property
````
curl http://localhost:8080/microprofile-config-four/air/four/lookup/aquarium

Ordinal   Name
400   SysPropConfigSource
	 aquarium : Tropical Pets
300   EnvConfigSource
	 aquarium : tank equipment
50   null:airFilter:FilterConfigSource
	 aquarium : fish-filter
````
SUCCESS!!  "Tropical Pets" is in SysPropConfigSource.
"tank equipment" in EnvConfigSource and the initial value, "fish-filter"
is in FilterConfigSource.
