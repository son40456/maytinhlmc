import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Bảo vệ trang quản trị (/admin) và các thao tác ghi dữ liệu của API (/api/admin)
    if (pathname.startsWith('/admin') || (pathname.startsWith('/api/admin') && request.method !== 'GET')) {
        const basicAuth = request.headers.get('authorization');
        
        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            // Decode base64
            const [user, pwd] = atob(authValue).split(':');

            const validUser = process.env.ADMIN_USERNAME;
            const validPwd = process.env.ADMIN_PASSWORD;

            if (user === validUser && pwd === validPwd) {
                return NextResponse.next();
            }
        }
        
        // Trả về 401 Unauthorized kèm header yêu cầu đăng nhập Basic Auth
        return new NextResponse('Auth required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Admin Secure Area"',
            },
        });
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
