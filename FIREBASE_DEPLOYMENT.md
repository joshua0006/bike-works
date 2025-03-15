# Firebase Deployment Instructions

## Firestore Security Rules

The `firestore.rules` file has been created with secure rules for your BikeWorks application. These rules:

1. Allow users to read and write only their own data
2. Allow bike and job creation by authenticated users
3. Allow bike and job access only by the owner or admin users

## How to Deploy the Rules

1. Install Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```
   firebase init
   ```
   - Select Firestore when prompted
   - Choose your project

4. Deploy the Firestore rules:
   ```
   firebase deploy --only firestore:rules
   ```

## Troubleshooting

If you're still encountering the "Missing or insufficient permissions" error after deploying the rules, try these steps:

1. Verify the rules were deployed correctly by checking the Firebase Console
2. Check if your Firebase project is correctly initialized
3. Make sure your app is using the correct Firebase project (matching the projectId)
4. Try running the app in an incognito window or clear your browser cache 