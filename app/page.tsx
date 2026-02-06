import { type ReactNode } from "react";

export default function Page() {
    return <Yassmina />;
}

function Mirou({
    children
}: {
    children: ReactNode;
}) {
    return <div>
        Mirou Loves {children}
    </div>
}

function Yassmina() {
    return <Mirou><div>Yassmina</div></Mirou>
}