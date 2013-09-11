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
            "inputType" : "url",
            "inputHint" : "mail@example.com"
        },
        {
            "label" : "Url",
            "jsonLdProperty" : "url",
            "expectedType" : "URL",
            "inputType" : "text",
            "inputHint" : "Enter Url..."
        },
        {
            "label" : "Affiliation",
            "jsonLdProperty" : "affiliation",
            "expectedType" : "URL",
            "inputType" : "PostalAddress",
            "inputHint" : "Enter organization User is affialiated to"
        },
        {
            "label" : "Alumni Of",
            "jsonLdProperty" : "alumniOf",
            "expectedType" : "EducationalOrganization",
            "inputType" : "text",
            "inputHint" : "Alumni of EducationalOrganization"
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
            "jsonLdProperty" : "Children",
            "expectedType" : "Person",
            "inputType" : "text",
            "inputHint" : "Children of the user"
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
            "inputHint" : "Member of organization"
        },
        {
            "label" : "Spose",
            "jsonLdProperty" : "spose",
            "expectedType" : "Person",
            "inputType" : "text",
            "inputHint" : "Spouse of User"
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
        "label" : "Map",
        "jsonLdProperty" : "map",
        "expectedType" : "url",
        "inputType" : "text",
        "inputHint" : "Enter link for a map"
    },
    {
        "label" : "Image",
        "jsonLdProperty" : "image",
        "expectedType" : "url",
        "inputType" : "text",
        "inputHint" : "Enter Image Url..."
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
            "inputHint" : "Full Name of the person"
        },
        {
            "label" : "Location",
            "jsonLdProperty" : "location",
            "expectedType" : "Place",
            "inputType" : "text",
            "inputHint" : "Enter the Location of Event"
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

var objects = {
    "Person" : Person,
    "Event" : Event,
    "Place" : Place
};
