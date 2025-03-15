# Deploying Firestore Rules for BikeWorks

This guide explains how to deploy the updated Firestore security rules to fix the "Missing or insufficient permissions" error for the sales screen.

## The Issue

The error occurs because the current Firestore security rules only allow users to read bikes that they own or if they're an admin. However, the sales screen needs to display all bikes with status "available" to all authenticated users.

## The Solution

We've updated the Firestore security rules to allow:
1. Any authenticated user to read bikes with status 'available'
2. Users to read bikes they own
3. Admin users to read all bikes

## Deployment Steps

1. **Ensure you have the Firebase CLI installed**
   ```
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```
   firebase login
   ```

3. **Initialize Firebase in the project (if not already done)**
   ```
   firebase init
   ```
   - Select "Firestore" when prompted for features
   - Select your Firebase project
   - Accept the default file names (firestore.rules and firebase.json)

4. **Deploy the updated rules**
   ```
   firebase deploy --only firestore:rules
   ```

## File Changes

The modified security rule for bikes now includes:

```
allow read: if request.auth != null && (
  resource.data.status == 'available' || 
  resource.data.userId == request.auth.uid || 
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
);
```

This allows any authenticated user to read bikes that have status 'available', while maintaining the existing permissions for user-specific bikes and admin access.

## Verifying the Fix

After deploying the rules:
1. Restart your app
2. Navigate to the sales screen
3. You should now be able to see all bikes with status "available" without the permission error

## Troubleshooting

If you continue to experience issues:
1. Ensure the bikes in your database have the 'status' field set to 'available'
2. Verify that users are properly authenticated
3. Check the Firebase console for any rule deployment errors 