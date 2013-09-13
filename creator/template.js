Person = {
    "@context" : "http://json-ld.org/contexts/schema.org.jsonld",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "@type" : "http://schema.org/Person",
    "label" : "Person",
    "fields" : [
        {
            "label" : "Name",
            "jsonLdProperty" : "name",
            "expectedType" : "text",
            "inputType" : "text",
            "inputHint" : "Full Name of the person"
        },
        {
            "label" : "Image",
            "jsonLdProperty" : "image",
            "expectedType" : "url",
            "inputType" : "url",
            "inputHint" : "URL of image for Person"
        },
        {
            "label" : "Address",
            "jsonLdProperty" : "address",
            "expectedType" : "Postal Address",
            "inputType" : "text",
            "inputHint" : "Enter Your address"
        },
        {
            "label" : "email",
            "jsonLdProperty" : "email",
            "expectedType" : "text",
            "inputType" : "email",
            "inputHint" : "mail@example.com"
        },
        {
            "label" : "Url",
            "jsonLdProperty" : "url",
            "expectedType" : "URL",
            "inputType" : "url",
            "inputHint" : "Enter an Url"
        },
        {
            "label" : "Affiliation",
            "jsonLdProperty" : "affiliation",
            "expectedType" : "URL",
            "inputType" : "url",
            "inputHint" : "URL of organization person is afiiliated to"
        },
        {
            "label" : "Alumni Of",
            "jsonLdProperty" : "alumniOf",
            "expectedType" : "EducationalOrganization",
            "inputType" : "url",
            "inputHint" : "URL of Educational Organization"
        },
        {
            "label" : "Award",
            "jsonLdProperty" : "award",
            "expectedType" : "text",
            "inputType" : "text",
            "inputHint" : "Awards and Achievements"
        },
        {
            "label" : "Date of birth",
            "jsonLdProperty" : "birthDate",
            "expectedType" : "Date",
            "inputType" : "date",
            "inputHint" : "Date of Birth"
        },
        {
            "label" : "Children",
            "jsonLdProperty" : "children",
            "expectedType" : "Person",
            "inputType" : "url",
            "inputHint" : "URL of a Child for Person"
        },
        {
            "label" : "Honorific Prefix",
            "jsonLdProperty" : "honorificPrefix",
            "expectedType" : "text",
            "inputType" : "text",
            "inputHint" : "Dr/Mrs/Mr."
        },
        {
            "label" : "Honorific Suffix",
            "jsonLdProperty" : "honorificSuffix",
            "expectedType" : "text",
            "inputType" : "text",
            "inputHint" : "M.D./PhD/MSCSW"
        },
        {
            "label" : "Member Of",
            "jsonLdProperty" : "memberOf",
            "expectedType" : "organization",
            "inputType" : "url",
            "inputHint" : "URL of organization Person is member of"
        },
        {
            "label" : "Spouse",
            "jsonLdProperty" : "spouse",
            "expectedType" : "Person",
            "inputType" : "url",
            "inputHint" : "Enter URL of spouse for Person"
        }

    ]
}

Place = {
    "@context" : "http://json-ld.org/contexts/schema.org.jsonld",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "@type" : "http://schema.org/Person",
    "label" : "Place",
    "fields" : [
    {
        "label" : "Name",
        "jsonLdProperty" : "name",
        "expectedType" : "text",
        "inputType" : "text",
        "inputHint" : "Name of the Place"
    },
    {
        "label" : "Image",
        "jsonLdProperty" : "image",
        "expectedType" : "url",
        "inputType" : "url",
        "inputHint" : "Enter Image Url..."
    },
    {
        "label" : "Map",
        "jsonLdProperty" : "map",
        "expectedType" : "url",
        "inputType" : "url",
        "inputHint" : "Enter URL for a map"
    },
    {
        "label" : "Address",
        "jsonLdProperty" : "address",
        "expectedType" : "PostalAddress",
        "inputType" : "text",
        "inputHint" : "Enter Address..."
    },
    {
        "label" : "Event",
        "jsonLdProperty" : "event",
        "expectedType" : "Event",
        "inputType" : "url      ",
        "inputHint" : "Enter URL of upcoming events"
    },
    {
        "label" : "Geo Coordinates",
        "jsonLdProperty" : "geo",
        "expectedType" : "GeoCoordinates",
        "inputType" : "text",
        "inputHint" : "Geo - Coordinats of the place"
    },
    {
        "label" : "photo",
        "jsonLdProperty" : "Photograph",
        "expectedType" : "url",
        "inputType" : "url",
        "inputHint" : "Enter URL of a photograph"
    },
    {
        "label" : "Telephone",
        "jsonLdProperty" : "telephone",
        "expectedType" : "text",
        "inputType" : "text",
        "inputHint" : "Telephone Number"
    }
    
    ]
}

Event = {
    "@context" : "http://json-ld.org/contexts/schema.org.jsonld",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "@type" : "http://schema.org/Event",
    "label" : "Event",
    "fields" : [
        {
            "label" : "Name",
            "jsonLdProperty" : "name",
            "expectedType" : "text",
            "inputType" : "text",
            "inputHint" : "Event Name"
        },
        {
            "label" : "Location",
            "jsonLdProperty" : "location",
            "expectedType" : "Place",
            "inputType" : "url",
            "inputHint" : "Enter URL of Location"
        },
        {
            "label" : "Start Date",
            "jsonLdProperty" : "startDate",
            "expectedType" : "Date",
            "inputType" : "date",
            "inputHint" : "Enter the start date of event"
        },
        {
            "label" : "End Date",
            "jsonLdProperty" : "endDate",
            "expectedType" : "Date",
            "inputType" : "date",
            "inputHint" : "Enter end date of the event"
        }
    ]
}
