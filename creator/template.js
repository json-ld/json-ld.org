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
            "inputType" : "text",
            "inputHint" : "Enter Image Url..."
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
            "inputHint" : "Enter Url..."
        },
        {
            "label" : "Affiliation",
            "jsonLdProperty" : "affiliation",
            "expectedType" : "URL",
            "inputType" : "PostalAddress",
            "inputHint" : "Enter URL of organization User is affialiated to"
        },
        {
            "label" : "Alumni Of",
            "jsonLdProperty" : "alumniOf",
            "expectedType" : "EducationalOrganization",
            "inputType" : "text",
            "inputHint" : "Enter URL of Educational Organization user is alumni of"
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
            "inputType" : "text",
            "inputHint" : "URL of Children of user"
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
            "inputType" : "text",
            "inputHint" : "Enter URL of organization user is member of"
        },
        {
            "label" : "Spouse",
            "jsonLdProperty" : "spouse",
            "expectedType" : "Person",
            "inputType" : "text",
            "inputHint" : "Enter URL of spuse"
        }

    ]
}

Place = {
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
        "inputHint" : "Name of the Place"
    },
    {
        "label" : "Image",
        "jsonLdProperty" : "image",
        "expectedType" : "url",
        "inputType" : "text",
        "inputHint" : "Enter Image Url..."
    },
    {
        "label" : "Map",
        "jsonLdProperty" : "map",
        "expectedType" : "url",
        "inputType" : "text",
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
        "inputType" : "text",
        "inputHint" : "Enter URL of upcoming events"
    },
    {
        "label" : "Geo Coordinats",
        "jsonLdProperty" : "geo",
        "expectedType" : "GeoCoordinats",
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
            "inputType" : "text",
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
