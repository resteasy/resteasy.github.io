---
layout:     post
title:      "MicroProfile REST Client 1.4; Examination of a MicroProfile REST Client Application"
subtitle:   ""
date:       Jun 1, 2020 
author:     Rebecca Searls
---
In this article I will create a simple MicroProfile Rest Client that calls a 
remote service.  In the process I will discuss the nuances in creating the 
REST client endpoint.  What is unique about @RegisterRestClient.  Why both 
@RegisterRestClient and @Path are required to be declared on the REST client 
endpoint and the rules in setting the baseUri on that class.
    

### Requriements
* Source code: [microprofile-rest-client](https://github.com/rsearls/blog-posts/tree/master/microprofile-rest-client)
* WildFly 19 or newer
* maven
* JDK 1.8 or newer


 
### The REST (Remote) Service
I've created a REST service that mocks a DB of cartoons organized into
categories and provides several endpoints for data retrieval.

```
@Path("/")
public class CartoonService {

    @GET
    @Path("/graphicNovels")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> getGraphicNovels ()
    {
        return graphicNovels;
    }

    @GET
    @Path("/tv")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> getTv ()
    {
        return tv;
    }

    @GET
    @Path("/get/{category}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> getCategory ( @PathParam("category") String category)
    {
        List<String> result = null;

        if (category != null && !category.isEmpty()) {
            result = categoryMap.get(category.toLowerCase());
        }

        if (result == null) {
            result = new ArrayList(Arrays.asList("Unknown category"));
        }
        return result;
    }

    /**
     * Simple check that service is available
     * @return
     */
    @GET
    @Path("/ping")
    public String ping ()
    {
        return "CartoonService is alive  ";
    }


    List<String> graphicNovels = new ArrayList(
            Arrays.asList("Nimona",
                    "Watchmen",
                    "Maus: A Survivors Tale"));

    List<String> tv = new ArrayList(
            Arrays.asList("The Jetsons",
                    "Rocky and Bullwinkle"));

    List<String> comics = new ArrayList(
            Arrays.asList("Beetle Baily",
                    "Dick Tracy",
                    "Krazy Kat"));

    HashMap<String, List<String>> categoryMap = new HashMap();

    public CartoonService() {
        categoryMap.put("graphicnovels", graphicNovels);
        categoryMap.put("tv", tv);
        categoryMap.put("comics", comics);
    }
}
```
I am choosing to provide an implementation of javax.ws.rs.core.Application
rather than configuring the app in a web.xml file.  This service
will be deployed separately from the microprofile rest client app.
```
@ApplicationPath("/theService")
public class ServiceActivator extends Application {
    /* class body intentionally left blank */
}
```


### The REST Client Interface 
To create a MicroProfile REST Client one needs to create an interface 
using JAX-RS and MicroProfile annotations which represents the remote service.
The interface must duplicate the method signature for each method to be accessed,
(i.e. annotations, return type, list of arguments, and exception declarations),
with one exception, only one HTTP (verb) method annotation is allowed per method in
the interface.  

>The Microprofile-Rest-Client specification, section Invalid Client Interface Examples, states,
>>```    
>>"The client interface method may contain, at most, one HTTP method annotation 
>> ....
>> If a (interface) method is annotated with more than one HTTP method, 
>> the implementation must throw a RestClientDefinitionException."
>>```
>

If the remote service method being duplicated has multiple HTTP method 
annotations, select only one of them to use on the method in the interface. 
The resource class created to use this interface can be defined in a way
to make reference the other HTTP methods.

The interface class must also have assigned to it annotations RegisterRestClient 
and Path.
 
```
@RegisterRestClient(baseUri ="http://localhost:8888/some-root-context")
@Path("/theService")
@Singleton
public interface CartoonServiceIntf {

    @GET
    @Path("/graphicNovels/json")
    @Produces(MediaType.APPLICATION_JSON)
    List<String> getGraphicNovels ();
    
    @GET
    @Path("/get/{category}")
    @Produces(MediaType.APPLICATION_JSON)
    List<String> getCategory ( @PathParam("category") String category);
    
}
```

+ RegisterRestClient is a required annotation.  It indicates to CDI that
  at runtime it must create a CDI bean for this interface and it must add
  the qualifier @RestClient to the bean.

  RegisterRestClient element baseUri enables the user to declare the base URI of the 
  remote service. 
  An appropriate property provided in the microprofile-config.properties file 
  will override this value.
  This information is used when the bean is created. The string need 
  not be a valid address but it must be a value that can be parsed by the URL/URI 
  converter.  If no parsable value is provided for the baseUri an exception will
  be thrown. 

>  Side Note:
>> The specification also states that RestClientBuilder's baseUrl method
>> can set the baseUri for the interface class, but this is not overriding
>> the RegisterRestClient's baseUri or properties file value.  It is creating a 
>> proxy object from a regular old POJO, the interface.  The setting in 
>> RegisterRestClient and the properties file come into play when CDI creates 
>> the bean and used when the bean is injected into a class.
>

#### Setting "base URL" Order of Precedence
The Microprofile Configuration specification defines this in detail.  Here are the general rules.
  - The value of baseUri in annotation RegisterRestClient has the lowest priority.
  - An appropriate property defined in the microprofile-config.properties 
    file overrides the annotation's value.  (Assuming the file is using the default priority.) 
  - An appropriate property defined as an environment variable on the command-line
    overrides the microprofile-config.properties file.
    ```
    (e.g. -Dorg.jboss.rest.comics.patron.CartoonServiceIntf/mp-rest/url=http://localhost:8080/microprofile-rest-client-service)
    ```
  - An appropriate system property overrides the environment variable.       

##### Examples of valid and invalid baseUri settings
>  The default value, "" for baseUri is overridden by the 
     properties file setting.
     The url is a valid uri string and a valid (functioning) address.
>>```  
>>@RegisterRestClient
>>public interface CartoonServiceIntf {   ...
>>    
>>microprofile-config.properties
>>org.jboss.rest.comics.patron.CartoonServiceIntf/mp-rest/url=http://localhost:8080/microprofile-rest-client-service
>>```
>

>BaseUri is set to a dummy but parsable uri.  The property in the 
   properties file overrides baseUri setting.  This is a valid setting.
>>```
>>@RegisterRestClient(baseUri ="http://localhost:8888/SOME-ROOT-CONTEXT")
>>  
>>microprofile-config.properties
>>org.jboss.rest.comics.patron.CartoonServiceIntf/mp-rest/url=http://localhost:8080/microprofile-rest-client-service
>>```
>

>BaseUri is set to a dummy parsable uri however the property in the
   properties file is not a parsable uri.  The character, ''\\'' is illegal.   
   Wildfly will throw an exception when the client calls the endpoint.
>>```
>>@RegisterRestClient(baseUri ="http://localhost:8888/some-root-context")
>>  
>>microprofile-config.properties
>>org.jboss.rest.comics.patron.CartoonServiceIntf/mp-rest/url=http://localhost:8080\microprofile-rest-client-service
>>```
>

>Both baseUri and mp-rest/url are parsable uris, however the url in the properties
   file is not a reachable address and it overrides the baseUri value.  Wildfly will throw
   an exception when the client calls the endpoint because the service can not
   be found at that address.
>>```
>>@RegisterRestClient(baseUri ="http://localhost:8080/microprofile-rest-client-service")
>>  
>>microprofile-config.properties
>>org.jboss.rest.comics.patron.CartoonServiceIntf/mp-rest/url=http://localhost:8888/some-root-context
>>```
>

>  The default value of baseUri is "".  It is not a parsable uri. No url is
   provided in the properties file to override it.  Wildfly will throw an
   exception.
>>```
>>@RegisterRestClient
>>  
>>microprofile-config.properties
>># file intentionally empty
>>```
>

>#### Best Practices
>>+ When the base URL of the remote service is static and known, define the 
        default base URL in the RegisterRestClient annotation or in the
        properties file.
>>+ When the base URL is not yet known and can be determined during the 
       run time, set the base URL through the RestClientBuilder.
>
>>+ It's debatable if its better to set a dummy parsable base URI in the
     RegisterRestClient annotation or leave it unset.  Both indicate to the 
     knowledgeable user to declare it in the property file. 
>


* Path is a required annotation on the interface.  The value of @Path is the 
  combined values of the service's ApplicationPath or (url-pattern) and the 
  service class' Path.

 
##### Examples of Path settings   
> If the service's settings are
>>```
>>@ApplicationPath("/theService")
>>public class ServiceActivator extends Application { ....
>>  
>>@Path("/guy")
>>public class CartoonService {  ....
>>```
>the Path must be
>>```
>>@Path("/theService/guy")
>>public interface CartoonServiceIntf { ....
>>```
>

>If the service's settings are
>>```
>>@ApplicationPath("/")
>>public class ServiceActivator extends Application { ....
>>  
>>@Path("/api")
>>public class CartoonService {  ....
>>```
>the Path must be
>>```
>>@Path("/api")
>>public interface CartoonServiceIntf { ....
>>```
>

>If the service's settings are
>>```
>>@ApplicationPath("/")
>>public class ServiceActivator extends Application { ....
>>  
>>@Path("/")
>>public class CartoonService {  ....
>>```
>then Path must be
>>```
>>@Path("/")
>>public interface CartoonServiceIntf { ....
>>```
>

>If the service's settings are
>>```
>>@ApplicationPath("")
>>public class ServiceActivator extends Application { ....
>>  
>>@Path("/")
>>public class CartoonService {  ....
>>```
>then Path must be
>>```
>>@Path("/")
>>public interface CartoonServiceIntf { ....
>>```
>

> ### Side Note
>One might think it is easier to just added the Path value in the
>baseUri but this will not work.  The under laying code requires these be set 
>separately.
>
>The service will not be found if baseUri and Path are combined and Path is
>set to the empty string or "/".
>>```
>>@RegisterRestClient(
>>baseUri ="http://localhost:8080/microprofile-rest-client-service/theService/guy")
>>@Path("")
>>  
>>microprofile-config.properties
>># file intentionally empty
>>```
>
>

* Setting the scope of the interface is optional.  The default scope
  is @Dependent.  I have chosen @Singleton. CDI will make the 
  proxy class a singleton when the bean is created.  You will need to 
  determine the appropriate scope setting for your application.

+ For CartoonServiceIntf I am choosing not to duplicate the whole remote service.
  This application is using just two of the service's APIs.
  
 
### The REST Client Resource
Next a JAX-RS Resource is created.  It is just a wrapper class for accessing
the methods defined in CartoonServiceIntf.  Access to the service is provided 
by injection.

```
@Path("/thePatron")
@ApplicationScoped
public class CartoonPatronResource {
    @Inject
    @RestClient CartoonServiceIntf service;

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> getAll(){
        List<String> result = new ArrayList<>();
        try {
            result.addAll(service.getCategory("GraphicNovels"));
            result.addAll(service.getCategory("TV"));
            result.addAll(service.getCategory("comics"));
        } catch (Exception e) {
            result.add(e.getMessage());
        }
        return result;
    }

    @GET
    @Path("/get/{category}")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> getCategory (@PathParam("category") String category){

        return service.getCategory(category);
    }

    /**
     * Simple check that service is available
     * @return
     */
    @GET
    @Path("/hello")
    public String getHello() {
        if (service == null) {
            return "Hello back.  the service is null";
        }
        return "Hello from CartoonPatronResource  ";
    }
}
```

* ApplicationScoped is an optional annotation.  Define the scope of 
the resource class as is appropriate to your application.

* RestClient is the qualifier added to any bean tagged with a RegisterRestClient
annotation.  It is used on an injection point to indicate the 
MicroProfile Rest Client runtime is to be used to satisfy the injection point
with a Type-Safe Rest Client (bean). 

>The Microprofile-Rest-Client specification,
>section MicroProfile Rest Client CDI Support, states
>>```
>>... for each interface annotated with RegisterRestClient. The bean 
>>created will include a qualifier @RestClient to differentiate the use 
>>as an API call against any other beans registered of the same type. Based on
>>the rules of how CDI resolves bean, you are only required to use the qualifier 
>>if you have multiple beans of the same type. Any injection point or programmatic 
>>look up that uses the qualifier RestClient is expected to be resolved by the 
>>MicroProfile Rest Client runtime.
>>```
>
>

In this scenario we have only one bean of type, CartoonServiceIntf, 
so the RestClient annotation is not required but it seems best 
practice would be to always declare it in order to provide clarity to the 
reader and to avoid future code maintenance issues.

* The methods are wrappers to calls to the remote service.

  It is here that one might want to address the multiple HTTP (verbs) on
  a service method issue.  A REST method here could duplicate the HTTP verbs
  and make a call to the corresponding service method, or individual
  methods for each verb could be declared and the service called.

Just as with the remote service I am choosing to provide an implementation 
of javax.ws.rs.core.Application for this web app.  This client app will be
deployed separately from the service app.

```
@ApplicationPath("/")
public class PatronActivator extends Application {
    /* class body intentionally left blank */
}
```


### Build and Deploy
```
mvn clean package
``` 
```
cp ./service/target/microprofile-rest-client-service.war ${WILDFLY_HOME}/standalone/deployments/.
cp ./client/target/microprofile-rest-client-client.war ${WILDFLY_HOME}/standalone/deployments/.
${WILDFLY_HOME}/bin/standalone.sh
``` 

#### Test the Service
Using cURL check that the remote service is accessible.

```
curl -v http://localhost:8080/microprofile-rest-client-service/theService/ping

CartoonService is alive  
```
```
curl -v http://localhost:8080/microprofile-rest-client-service/theService/get/comics

["Beetle Baily","Dick Tracy","Krazy Kat"]
```


#### Test the Client
Using cURL check that the client is working.
```
curl -v http://localhost:8080/microprofile-rest-client-client/thePatron/hello

Hello from CartoonPatronResource
```
```
curl -v http://localhost:8080/microprofile-rest-client-client/thePatron/all

["Nimona","Watchmen","Maus: A Survivors Tale","The Jetsons","Rocky and Bullwinkle","Beetle Baily","Dick Tracy","Krazy Kat"]
```
