exports.service = {
    name: "",
    description: "",
    idRegion: 11001,
    userId: 0,
    isActive: 1,
    isDeleted: 0
};


exports.servicesContent = {
    idService: 0,
    name: "",
    description: "",
    idRegion: 0,
    userId: 0,
    isActive: 0,
    isDeleted: 0,
    timestamp: "",
    tags: [
        {
            idSrvCat: 0,
            idTag: 0,
            tag: "",
            observation: ""
        }
    ],
    contents: [
        {
            idSegment: 0,
            description: "",
            order: 0,
            idCourse: 0,
            idProduct: 0,
            idContent: 0,
            isActive: 1,
            isDeleted: 0,
            name: ""
        }
    ]
};


exports.categories = {
    tag: "",
    observation: "",
    isActive: 1,
    isDeleted: 0
};