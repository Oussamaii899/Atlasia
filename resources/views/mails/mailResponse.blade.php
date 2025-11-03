<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post Review Response</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <!-- Main Container -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- Email Card -->
                <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px;border:1px solid rgba(0, 0, 0, 0.5); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); overflow: hidden; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 50px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                📝 Post Review Update
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                Your submission has been reviewed
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            
                            <!-- Greeting -->
                            <p style="margin: 0 0 24px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                Hello <strong>{{ $user->name }}</strong>,
                            </p>
                            
                            @if($place->status == "approved")
                                <!-- Approved Status Card -->
                                <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                        <span style="font-size: 32px; margin-right: 12px;">✅</span>
                                        <h2 style="margin: 0; color: #065f46; font-size: 20px; font-weight: 700;">
                                            Congratulations! Post Approved
                                        </h2>
                                    </div>
                                    <p style="margin: 12px 0 0; color: #047857; font-size: 15px; line-height: 1.6;">
                                        Your post <strong style="color: #065f46;">"{{ $place->name }}"</strong> has been reviewed and accepted!
                                    </p>
                                </div>
                                
                                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                                    🎉 Your content is now <strong>live and visible</strong> to all users. Thank you for your valuable contribution to our community!
                                </p>
                                
                            @elseif($place->status == "rejected")
                                <!-- Rejected Status Card -->
                                <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #ef4444; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                        <span style="font-size: 32px; margin-right: 12px;">❌</span>
                                        <h2 style="margin: 0; color: #991b1b; font-size: 20px; font-weight: 700;">
                                            Post Not Approved
                                        </h2>
                                    </div>
                                    <p style="margin: 12px 0 0; color: #dc2626; font-size: 15px; line-height: 1.6;">
                                        Unfortunately, your post <strong style="color: #991b1b;">"{{ $place->name }}"</strong> could not be approved at this time.
                                    </p>
                                </div>
                                
                                @if(!empty($reason))
                                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                                        <p style="margin: 0 0 8px; color: #374151; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Reason for Rejection
                                        </p>
                                        <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                                            {{ $reason }}
                                        </p>
                                    </div>
                                @endif
                                
                                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                                    💡 Please review the feedback above, make the necessary adjustments, and feel free to resubmit your post.
                                </p>
                                
                            @else
                                <!-- Pending Status Card -->
                                <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid #f59e0b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                        <span style="font-size: 32px; margin-right: 12px;">⏳</span>
                                        <h2 style="margin: 0; color: #92400e; font-size: 20px; font-weight: 700;">
                                            Post Under Review
                                        </h2>
                                    </div>
                                    <p style="margin: 12px 0 0; color: #d97706; font-size: 15px; line-height: 1.6;">
                                        Your post <strong style="color: #92400e;">"{{ $place->name }}"</strong> is currently in the review queue.
                                    </p>
                                </div>
                                
                                <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                                    ⏰ An administrator will review your submission soon. We'll notify you as soon as a decision is made.
                                </p>
                            @endif
                            
                            <!-- Post Details Box -->
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
                                    <tr>
                                        <td style="font-weight: 600; padding: 12px 0 0; color: #374151; font-size: 14px;">Status:</td>
                                        <td style="padding: 12px 0 0; font-size: 14px;">
                                            @if($place->status == "approved")
                                                <span style="color: #10b981; font-weight: 600;">✓ Approved</span>
                                            @elseif($place->status == "rejected")
                                                <span style="color: #ef4444; font-weight: 600;">✗ Rejected</span>
                                            @else
                                                <span style="color: #f59e0b; font-weight: 600;">⏳ Pending</span>
                                            @endif
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            

                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                                Need help? Contact our support team or visit our help center.
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
