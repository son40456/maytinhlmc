import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Bảo vệ trang quản trị (/admin) và các thao tác ghi dữ liệu của API (/api/admin)
    if (pathname.startsWith('/admin') || (pathname.startsWith('/api/admin') && request.method !== 'GET')) {
        
        // Ngoại trừ trang đăng nhập
        if (pathname.startsWith('/admin-login')) {
            return NextResponse.next();
        }

        const token = request.cookies.get('admin_token')?.value;
        const validUser = process.env.ADMIN_USERNAME;
        const validPwd = process.env.ADMIN_PASSWORD;

        // Mã hóa lại token mẫu để so sánh
        const expectedToken = btoa(`${validUser}:${validPwd}`);
        
        if (token && token === expectedToken) {
            return NextResponse.next();
        }
        
        // Nếu là API call thì trả về 401
        if (pathname.startsWith('/api/admin')) {
             return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                 status: 401,
                 headers: { 'Content-Type': 'application/json' }
             });
        }
        
        // Nếu là truy cập giao diện, chuyển hướng về trang đăng nhập
        const loginUrl = new URL('/admin-login', request.url);
        return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
