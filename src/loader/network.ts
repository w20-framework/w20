function getCookie(name: string): string {
    let c = document.cookie;
    let v = 0;
    const cookies: {[name: string]: string} = {};
    if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
        c = RegExp.$1;
        v = 1;
    }
    if (v === 0) {
        c.split(/[,;]/).map(cookie => {
            const parts = cookie.split(/=/, 2);
            const cookieName = decodeURIComponent(parts[0].replace(/^\s+/, ""));
            cookies[cookieName] = parts.length > 1 ? decodeURIComponent(parts[1].replace(/\s+$/, "")) : null;
        });
    } else {
        c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(($0, $1) => {
            cookies[$0] = (<any> $1).charAt(0) === '"' ? (<any> $1).substr(1, -1).replace(/\\(.)/g, "$1") : $1;
        });
    }
    return cookies[name];
}

export function fetch(path: string, withCredentials: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        if ('withCredentials' in xhr) {
            xhr.withCredentials = withCredentials;
        }
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (xsrfToken) {
            xhr.setRequestHeader("X-XSRF-TOKEN", xsrfToken);
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                let status = xhr.status || 0;
                if (status > 399 && status < 600) {
                    let err: any = new Error(`${path} HTTP status: ${status}`);
                    err['xhr'] = xhr;
                    reject(err);
                } else {
                    resolve(xhr.responseText);
                }
            }
        };
        xhr.send(null);
    }).catch(e => {
        console.error(e);
        return Promise.reject(e);
    });
}
