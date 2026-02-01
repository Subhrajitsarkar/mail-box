import { useEffect } from "react";

export default function useOnMount(callback) {
    useEffect(() => {
        callback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
