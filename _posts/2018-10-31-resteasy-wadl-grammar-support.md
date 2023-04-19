---
layout:     post
title:       "RESTEasy WADL Grammar Support"
subtitle:   ""
date:       Oct 31, 2018 4:42:00 AM
author:     Weinan Li
---

RESTEasy has added WADL grammar support by this PR:

- [RESTEASY-1695 Add GRAMMARS into RESTEasy WADL by liweinan · Pull Request #1649 · resteasy/resteasy · GitHub](https://github.com/resteasy/resteasy/pull/1649)

The major change is that `ResteasyWadlGrammar` is added into `ResteasyWadlWriter`：

![Class+Diagram22](/img/blog/Class+Diagram22.png)

In addition, the `ResteasyWadlWriter` is rewritten now, and all the static methods are now instance methods. It means users need to create an instance of `ResteasyWadlWriter` and put it into per-deployment scope.

To avoid people to write the boilerplate code, the `ResteasyWadlDefaultResource` can be used for deployment, and it can be put into the `getSingleton()` method of `Application` class:


```
@Provider
@ApplicationPath("/")
public class WadlTestApplication extends Application {

   public static Set<Class<?>> classes = new HashSet<Class<?>>();
   public static Set<Object> singletons = new HashSet<Object>();
...
   @Override
   public Set<Object> getSingletons() {
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

```

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
@XmlRootElement(name = "listType")
public class ListType {
    private List <String> values;

    @XmlElement

    public List<String> getValues() {

        return values;

    }

    public void setValues(List<String> values) {

        this.values = values;

    }
}

```
And it’s used in resource class:

```java

import javax.ws.rs.Consumes;

import javax.ws.rs.POST;

import javax.ws.rs.Path;

@Path("/extended")

public class ExtendedResource {

    @POST

    @Consumes({"application/xml"})

    public String post(ListType income) {

        return "foo";

    }

}

```
 
And if we enable the grammar generation as shown above, then we will get sample output from `/application.xml` like this:

```xml

$ http http://localhost:8081/application.xml

HTTP/1.1 200 OK

Content-type: application/xml;charset=UTF-8

Date: Wed, 31 Oct 2018 07:57:38 GMT

Transfer-encoding: chunked
 
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<application xmlns="
[http://wadl.dev.java.net/2009/02](http://wadl.dev.java.net/2009/02)
">
    <grammars>
        <include href="xsd0.xsd">
            <doc title="Generated" xml:lang="en"/>
        </include>
    </grammars>
…
</application>

```

The above output shows that a grammar file is genrated, and it is called `xsd0.xsd`. The instance of `ResteasyWadlDefaultResource` will prepare a URL link named `/wadl-extended`, and it will serve the generated grammar file. Here is the example:

```xml
$ http http://localhost:8081/wadl-extended/xsd0.xsd

HTTP/1.1 200 OK

Content-type: application/xml;charset=UTF-8

Date: Wed, 31 Oct 2018 07:58:53 GMT

Transfer-encoding: chunked

<?xml version="1.0" standalone="yes"?>

<xs:schema version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xs:element name="listType" type="listType"/>

  <xs:complexType name="listType">

    <xs:sequence>

      <xs:element name="values" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>

    </xs:sequence>

  </xs:complexType>

</xs:schema>

```
As shown in the above example, the grammar is generated for `ListType` entity class. If you don’t want RESTEasy to generate the grammar file for you, you can use the `includeGrammars()` method provided by the instance of `ResteasyWadlGrammar`. Here is an example:


```java

ResteasyWadlWriter.ResteasyWadlGrammar wadlGrammar = new ResteasyWadlWriter.ResteasyWadlGrammar();

wadlGrammar.includeGrammars(“application-grammars.xml”);
...
```
 

The `application-grammars.xml` file is grammar descriptor file provided by yourself, and it should be put into your project’s classpath. Here is a sample of `application-grammars.xml`:

```xml

<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<grammars xmlns="http://wadl.dev.java.net/2009/02"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:xi="http://www.w3.org/1999/XML/xinclude">
    <include href="schema.xsd" />
</grammars>

```

From above file we can see `schema.xsd` is the included schema file, and it should also be provided by yourself. Here is a sample of `schema.xsd`:

```xml

<?xml version=“1.0” encoding=“UTF-8” standalone=“yes”?>
<xs:schema version=“1.0” xmlns:xs="http://www.w3.org/2001/XMLSchema"/>

    <xs:element name=“listType” type=“listType”/> 

    <xs:complexType name=“listType”>

        <xs:sequence>

            <xs:element name=“values” type=“xs:string” minOccurs=“0” maxOccurs=“unbounded”/>

        </xs:sequence>

    </xs:complexType>

</xs:schema>

```

And if you have called `wadlGrammar.includeGrammars(“application-grammars.xml”)`, then you will get the included section in `/application.xml`:
 
```xml

<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<application xmlns="http://wadl.dev.java.net/2009/02">
    <grammars>
        <include href="schema.xsd"/>
    </grammars>

...

</application>

```

As the example shown above, the `schema.xsd` is included, and it can be fetched by using `/wadl-extended/schema.xsd` if you have registered the instance of `ResteasyWadlDefaultResource` into your `Application` and setup `ResteasyWadlGrammar` properly:
 

```xml

$ http http://localhost:8081/wadl-extended/schema.xsd

HTTP/1.1 200 OK

Content-type: application/xml;charset=UTF-8

Date: Wed, 31 Oct 2018 08:12:56 GMT

Transfer-encoding: chunked

<?xml version="1.0" encoding="UTF-8" standalone="yes"?>


<xs:schema version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">

    <xs:element name="listType" type="listType"/>

    <xs:complexType name="listType">

        <xs:sequence>

            <xs:element name="values" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>

        </xs:sequence>

    </xs:complexType>

</xs:schema>

```

Above is the description about the RESTEasy WADL Grammar feature.

The other change is that `ResteasyWadlServlet` and `ResteasyWadlServletWriter` is now deprecated, because it doesn’t support the grammar feature, and these two classes will be removed from master branch in the future. Using `ResteasyWadlDefaultResource` is recommended to enable the WADL feature.


             
                
