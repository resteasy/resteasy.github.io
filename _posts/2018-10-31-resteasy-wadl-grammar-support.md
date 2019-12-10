---
layout:     post
title:       "RESTEasy WADL Grammar Support"
subtitle:   ""
date:       Oct 31, 2018 4:42:00 AM
author:     Weinan Li
---


                    



                    




# RESTEasy WADL Grammar Support

RESTEasy has added WADL grammar support by this PR:

 

 


- [RESTEASY-1695 Add GRAMMARS into RESTEasy WADL by liweinan · Pull Request #1649 · resteasy/Resteasy · GitHub](
[https://github.com/resteasy/Resteasy/pull/1649](https://github.com/resteasy/Resteasy/pull/1649)
)


 

 

The major change is that `ResteasyWadlGrammar` is added into `ResteasyWadlWriter`：

 

 

[![image](https://developer.jboss.org/servlet/JiveServlet/downloadImage/38-6233-260966/Class+Diagram22.png)](https://developer.jboss.org/servlet/JiveServlet/showImage/38-6233-260966/Class+Diagram22.png)

 

In addition, the `ResteasyWadlWriter` is rewritten now, and all the static methods are now instance methods. It means users need to create an instance of `ResteasyWadlWriter` and put it into per-deployment scope.

 

 

To avoid people to write the boilerplate code, the `ResteasyWadlDefaultResource` can be used for deployment, and it can be put into the `getSingleton()` method of `Application` class:

 

 

```java

@Provider

@ApplicationPath(&#34;/&#34;)

public class WadlTestApplication extends Application {

   public static Set&lt;Class&lt;?&gt;&gt; classes = new HashSet&lt;Class&lt;?&gt;&gt;();

   public static Set&lt;Object&gt; singletons = new HashSet&lt;Object&gt;();

...

   @Override

   public Set&lt;Object&gt; getSingletons() {

   ...

         ResteasyWadlDefaultResource defaultResource = new ResteasyWadlDefaultResource();

         singletons.add(defaultResource);

      }

      return singletons;

   }

}

```

 

 

And then the URL `/application.xml` is enabled by the methods inside `ResteasyWadlDefaultResource`.

 

 

To enable the WADL Grammar support, users need to create an instance of `ResteasyWadlGrammar` and put it into the instance of `ResteasyWadlWriter`.

 

 

The recommended way is to use it with `ResteasyWadlDefaultResource`. Here is an example:

 

 

```java

ResteasyWadlDefaultResource defaultResource = new ResteasyWadlDefaultResource();

 

 

ResteasyWadlWriter.ResteasyWadlGrammar wadlGrammar = new ResteasyWadlWriter.ResteasyWadlGrammar();

wadlGrammar.enableSchemaGeneration();

 

 

defaultResource.getWadlWriter().setWadlGrammar(wadlGrammar);

```

 

 

As the code shown above, we have created an instance of `ResteasyWadlGrammar`, and it’s injected into the `ResteasyWadlWriter` instance included by `ResteasyWadlDefaultResource` instance.

 

 

In addition, we have called the `wadlGrammar.enableSchemaGeneration()` method, and it will scan the resources classes, and generate grammar files for JAXB annotated classes. Suppose we have entity class like this:

 

 

```java

import javax.xml.bind.annotation.XmlElement;

import javax.xml.bind.annotation.XmlRootElement;

import java.util.List;

 

 

@XmlRootElement(name = &#34;listType&#34;)

public class ListType {

 

 

    private List&lt;String&gt; values;

 

 

    @XmlElement

    public List&lt;String&gt; getValues() {

        return values;

    }

 

 

    public void setValues(List&lt;String&gt; values) {

        this.values = values;

    }

}

```

 

 

And it’s used in resource class:

 

 

```java

import javax.ws.rs.Consumes;

import javax.ws.rs.POST;

import javax.ws.rs.Path;

 

 

@Path(&#34;/extended&#34;)

public class ExtendedResource {

 

 

    @POST

    @Consumes({&#34;application/xml&#34;})

    public String post(ListType income) {

        return &#34;foo&#34;;

    }

}

```

 

 

And if we enable the grammar generation as shown above, then we will get sample output from `/application.xml` like this:

 

 

```xml


$ http 
[http://localhost:8081/application.xml](http://localhost:8081/application.xml)

HTTP/1.1 200 OK

Content-type: application/xml;charset=UTF-8

Date: Wed, 31 Oct 2018 07:57:38 GMT

Transfer-encoding: chunked

 

 

&lt;?xml version=&#34;1.0&#34; encoding=&#34;UTF-8&#34; standalone=&#34;yes&#34;?&gt;


&lt;application xmlns=&#34;
[http://wadl.dev.java.net/2009/02](http://wadl.dev.java.net/2009/02)
&#34;&gt;


    &lt;grammars&gt;

        &lt;include href=&#34;xsd0.xsd&#34;&gt;

            &lt;doc title=&#34;Generated&#34; xml:lang=&#34;en&#34;/&gt;

        &lt;/include&gt;

    &lt;/grammars&gt;

…

&lt;/application&gt;

```

 

 

The above output shows that a grammar file is genrated, and it is called `xsd0.xsd`. The instance of `ResteasyWadlDefaultResource` will prepare a URL link named `/wadl-extended`, and it will serve the generated grammar file. Here is the example:

 

 

```xml


$ http 
[http://localhost:8081/wadl-extended/xsd0.xsd](http://localhost:8081/wadl-extended/xsd0.xsd)

HTTP/1.1 200 OK

Content-type: application/xml;charset=UTF-8

Date: Wed, 31 Oct 2018 07:58:53 GMT

Transfer-encoding: chunked

 

 

&lt;?xml version=&#34;1.0&#34; standalone=&#34;yes&#34;?&gt;


&lt;xs:schema version=&#34;1.0&#34; xmlns:xs=&#34;
[http://www.w3.org/2001/XMLSchema](http://www.w3.org/2001/XMLSchema)
&#34;&gt;


 

 

  &lt;xs:element name=&#34;listType&#34; type=&#34;listType&#34;/&gt;

 

 

  &lt;xs:complexType name=&#34;listType&#34;&gt;

    &lt;xs:sequence&gt;

      &lt;xs:element name=&#34;values&#34; type=&#34;xs:string&#34; minOccurs=&#34;0&#34; maxOccurs=&#34;unbounded&#34;/&gt;

    &lt;/xs:sequence&gt;

  &lt;/xs:complexType&gt;

&lt;/xs:schema&gt;

```

 

 

As shown in the above example, the grammar is generated for `ListType` entity class. If you don’t want RESTEasy to generate the grammar file for you, you can use the `includeGrammars()` method provided by the instance of `ResteasyWadlGrammar`. Here is an example:

 

 

```java

ResteasyWadlWriter.ResteasyWadlGrammar wadlGrammar = new ResteasyWadlWriter.ResteasyWadlGrammar();

wadlGrammar.includeGrammars(“application-grammars.xml”);

...

```

 

 

The `application-grammars.xml` file is grammar descriptor file provided by yourself, and it should be put into your project’s classpath. Here is a sample of `application-grammars.xml`:

 

 

```xml

&lt;?xml version=&#34;1.0&#34; encoding=&#34;UTF-8&#34; standalone=&#34;yes&#34;?&gt;


&lt;grammars xmlns=&#34;
[http://wadl.dev.java.net/2009/02](http://wadl.dev.java.net/2009/02)
&#34;



    xmlns:xsd=&#34;
[http://www.w3.org/2001/XMLSchema](http://www.w3.org/2001/XMLSchema)
&#34;



    xmlns:xi=&#34;
[http://www.w3.org/1999/XML/xinclude](http://www.w3.org/1999/XML/xinclude)
&#34;&gt;


    &lt;include href=&#34;schema.xsd&#34; /&gt;

&lt;/grammars&gt;

```

 

 

From above file we can see `schema.xsd` is the included schema file, and it should also be provided by yourself. Here is a sample of `schema.xsd`:

 

 

```xml

&lt;?xml version=“1.0” encoding=“UTF-8” standalone=“yes”?&gt;


&lt;xs:schema version=“1.0” xmlns:xs=“
[http://www.w3.org/2001/XMLSchema”](http://www.w3.org/2001/XMLSchema”)
&gt;


 

 

    &lt;xs:element name=“listType” type=“listType”/&gt;

 

 

    &lt;xs:complexType name=“listType”&gt;

        &lt;xs:sequence&gt;

            &lt;xs:element name=“values” type=“xs:string” minOccurs=“0” maxOccurs=“unbounded”/&gt;

        &lt;/xs:sequence&gt;

    &lt;/xs:complexType&gt;

&lt;/xs:schema&gt;

```

 

 

And if you have called `wadlGrammar.includeGrammars(“application-grammars.xml”)`, then you will get the included section in `/application.xml`:

 

 

```xml

&lt;?xml version=&#34;1.0&#34; encoding=&#34;UTF-8&#34; standalone=&#34;yes&#34;?&gt;


&lt;application xmlns=&#34;
[http://wadl.dev.java.net/2009/02](http://wadl.dev.java.net/2009/02)
&#34;&gt;


    &lt;grammars&gt;

        &lt;include href=&#34;schema.xsd&#34;/&gt;

    &lt;/grammars&gt;

...

&lt;/application&gt;

```

 

 

As the example shown above, the `schema.xsd` is included, and it can be fetched by using `/wadl-extended/schema.xsd` if you have registered the instance of `ResteasyWadlDefaultResource` into your `Application` and setup `ResteasyWadlGrammar` properly:

 

 

```xml


$ http 
[http://localhost:8081/wadl-extended/schema.xsd](http://localhost:8081/wadl-extended/schema.xsd)

HTTP/1.1 200 OK

Content-type: application/xml;charset=UTF-8

Date: Wed, 31 Oct 2018 08:12:56 GMT

Transfer-encoding: chunked

 

 

&lt;?xml version=&#34;1.0&#34; encoding=&#34;UTF-8&#34; standalone=&#34;yes&#34;?&gt;


&lt;xs:schema version=&#34;1.0&#34; xmlns:xs=&#34;
[http://www.w3.org/2001/XMLSchema](http://www.w3.org/2001/XMLSchema)
&#34;&gt;


 

 

    &lt;xs:element name=&#34;listType&#34; type=&#34;listType&#34;/&gt;

 

 

    &lt;xs:complexType name=&#34;listType&#34;&gt;

        &lt;xs:sequence&gt;

            &lt;xs:element name=&#34;values&#34; type=&#34;xs:string&#34; minOccurs=&#34;0&#34; maxOccurs=&#34;unbounded&#34;/&gt;

        &lt;/xs:sequence&gt;

    &lt;/xs:complexType&gt;

&lt;/xs:schema&gt;

```

 

 

Above is the description about the RESTEasy WADL Grammar feature.

 

 

The other change is that `ResteasyWadlServlet` and `ResteasyWadlServletWriter` is now deprecated, because it doesn’t support the grammar feature, and these two classes will be removed from master branch in the future. Using `ResteasyWadlDefaultResource` is recommended to enable the WADL feature.




                    




                    

                    


                
