import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        const validUser = process.env.ADMIN_USERNAME;
        const validPwd = process.env.ADMIN_PASSWORD;

        if (!validUser || !validPwd) {
            return NextResponse.json(
                { error: 'Cấu hình hệ thống chưa hoàn tất. Thiếu tài khoản đăng nhập.' },
                { status: 500 }
            );
        }

        if (username === validUser && password === validPwd) {
            // Generate a simple token (in production this should be a real JWT)
            // For this specific use case, since we just check equality with the env variable in middleware, 
            // we can just encrypt/encode it slightly or just set a static token. 
            // We'll set a token that is a base64 encoded string of the username + a timestamp, 
            // but actually the simplest is just to set a generic token and verify its presence, 
            // OR set a hash. Let's just set a string that middleware can verify.
            
            // For simplicity and speed without external libraries, we use the password itself as the token value (or a derived value)
            // since middleware can read it and compare with process.env.ADMIN_PASSWORD.
            // Better: use a simple token.
            const token = btoa(`${username}:${password}`);

            const response = NextResponse.json({ success: true }, { status: 200 });
            
            // Set HttpOnly cookie
            response.cookies.set({
                name: 'admin_token',
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });

            return response;
        }

        return NextResponse.json(
            { error: 'Tài khoản hoặc mật khẩu không chính xác.' },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi hệ thống.' },
            { status: 500 }
        );
    }
}
