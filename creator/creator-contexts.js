var contexts = {};

contexts.person = {
  "@context" : {
    "@vocab": "http://schema.org/",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "image" : {
      "@type" : "@id"
    },	
    "address": {
      "@type": "@id"
    },
    "alumniOf": {
       "@type": "@id"
    },
    "birthDate": {
      "@type": "xsd:date"
    },
    "nationality": {
      "@type": "@id"
    },
    "spouse": {
      "@type": "@id"
    },
    "workLocation": {
      "@type": "@id"
    },
    "worksFor": {
      "@type": "@id"
    }
 
  }
}

contexts.events = {
  "@context" : {
    "@vocab": "http://schema.org/",
    "image" : {
        "@type" : "@id"
    },
    "location" : {
        "@type" : "@id"
    },
    "startDate" : {
        "@type": "xsd:date"
    },
    "endDate" : {
        "@type": "xsd:date"
    }
  }
}

contexts.place = {
  "@context" : {
    "@vocab": "http://schema.org/",
    "image" : {
        "@type" : "@id"
    },
    "latitude": {
      "@type": "xsd:float"
    },
    "longitude": {
      "@type": "xsd:float"
    },
    "map" : {
      "@type": "@id"
    }
  }
}