
const params = {
    href: 'string',
    children: 'string',
    styles: 'string'
};


const LinkPrimary = ({
    href,
    styles,
    children,
}: typeof params) => {
    return (
        <a
            className={`inline-block rounded-sm border border-naranja-claro px-12 py-3 text-sm font-medium text-naranja-claro hover:bg-naranja-claro hover:text-black focus:ring-3 focus:outline-hidden ${styles}`}
            href={href}
            >
            {children}
        </a>
    );
}

const LinkSecondary = ({
    href,
    styles,
    children,
}: typeof params) => {
    return (
        <a
            className={`inline-block rounded-sm border border-naranja-claro bg-naranja-claro px-12 py-3 text-sm font-medium text-background hover:bg-transparent hover:text-naranja-claro focus:ring-3 focus:outline-hidden ${styles}`}
            href={href}
            >
            {children}
        </a>
    );
}

export { LinkPrimary, LinkSecondary };