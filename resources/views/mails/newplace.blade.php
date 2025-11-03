<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Post Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; border: 1px solid rgba(0, 0, 0, 0.1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); overflow: hidden; max-width: 600px;">
                    
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 50px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                🎉 New Post Submission
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                A new place has been submitted for review
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px;">
                            
                            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                    <span style="font-size: 32px; margin-right: 12px;">👤</span>
                                    <h2 style="margin: 0; color: #1e40af; font-size: 20px; font-weight: 700;">
                                        Submitted by {{ $user->name }}
                                    </h2>
                                </div>
                                <p style="margin: 12px 0 0; color: #1e3a8a; font-size: 15px; line-height: 1.6;">
                                    A new post <strong style="color: #1e40af;">"{{ $place->name }}"</strong> is awaiting your review.
                                </p>
                            </div>
                            
                            
                                <div style="margin: 24px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                                        <img src={{ $message->embed(storage_path('app/public/'. str_replace("/storage/","", $image))) }} style="width: 100%; height: auto; display: block;">
                                </div>
                            
                            
                            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                                <p style="margin: 0 0 16px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Post Details
                                </p>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="font-weight: 600; padding: 8px 0; color: #374151; font-size: 14px; width: 30%;">Name:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{ $place->name }}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; padding: 8px 0; color: #374151; font-size: 14px;">Category:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{ $category->nom }}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; padding: 8px 0; color: #374151; font-size: 14px;">Description:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{ $place->description }}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; padding: 8px 0; color: #374151; font-size: 14px;">Address:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{ $place->address }}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; padding: 8px 0; color: #374151; font-size: 14px;">Website:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{ $place->website }}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; padding: 8px 0; color: #374151; font-size: 14px;">Email:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{ $place->email }}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; padding: 8px 0; color: #374151; font-size: 14px;">Phone:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{ $place->phone }}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; padding: 8px 0; color: #374151; font-size: 14px;">City:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">{{ $place->city }}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 16px 0;">
                                ⚡ Please review this submission and take appropriate action.
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $link }}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                            Review Post Details →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                                This is an automated notification for new post submissions.
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                © {{ date('Y') }} Atlasia. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
