interface Group {
    title: string;
    links: {
        name: string;
        url: string;
        target_blank?: boolean;
        type?: "legal";
    }[]
}

export const GROUPS: Group[] = [
    { 
        title: "Product", 
        links: [
            { name: "Product", url: "#product", target_blank: false },
            { name: "How it works", url: "#how-it-works", target_blank: false },
            { name: "Why ResolveOS", url: "#why-resolveos", target_blank: false },
            { name: "Security", url: "#security", target_blank: false }
        ]
    },
    { 
        title: "Resources", 
        links: [
            { name: "Documentation", url: "#top", target_blank: false }, 
            { name: "Architecture", url: "#top", target_blank: false }, 
            { name: "Guides", url: "#top", target_blank: false }
        ] 
    },
    { 
        title: "Company", 
        links: [
            { name: "About", url: "#top", target_blank: false }, 
            { name: "Contact", url: "#top", target_blank: false }, 
            { name: "GitHub", url: "https://github.com/nexuslabs-eng/resolve-os", target_blank: true}
        ] 
    },
    { 
        title: "Legal", 
        links: [
            { name: "Privacy", url: "/privacy", type: "legal" }, 
            { name: "Terms", url: "/terms", type: "legal" }
        ] 
    },
];
