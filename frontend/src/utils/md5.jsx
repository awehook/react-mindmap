import crypto from 'crypto';

// write a md5 function
export function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
