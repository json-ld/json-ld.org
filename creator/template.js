Person = {
    "@context" : "http://json-ld.org/contexts/schema.org.jsonld",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "@type" : "http://schema.org/Person",
    "label" : "Person",
    "fields" : [
        {
            "label" : "Name",
            "jsonLdProperty" : "name",
            "inputType" : "text",
            "inputHint" : "Full Name of the person"
        },
        {
            "label" : "Image",
            "jsonLdProperty" : "url",
            "inputType" : "text",
            "inputHint" : "Enter Image Url..."
        },
        {
            "label" : "Address",
            "jsonLdProperty" : "address",
            "inputType" : "text",
            "inputHint" : "Enter Your address"
        },
        {
            "label" : "email",
            "jsonLdProperty" : "text",
            "inputType" : "text",
            "inputHint" : "mail@example.com"
        },
        {
            "label" : "Url",
            "jsonLdProperty" : "url",
            "inputType" : "text",
            "inputHint" : "Enter Url..."
        }
    ]
}

Place = {

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
            "inputType" : "text",
            "inputHint" : "Full Name of the person"
        },
        {
            "label" : "Location",
            "jsonLdProperty" : "location",
            "inputType" : "text",
            "inputHint" : "Enter the Location of Event"
        },
        {
            "label" : "Start Date",
            "jsonLdProperty" : "startDate",
            "inputType" : "date",
            "inputHint" : "Enter the start date of event"
        },
        {
            "label" : "End Date",
            "jsonLdProperty" : "endDate",
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
