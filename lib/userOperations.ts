import { db } from './firebase';
import { doc, updateDoc, arrayUnion, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import type { User, Bike, Job } from '../types';
import { getAuth } from 'firebase/auth';

/**
 * Associates a bike with a user by adding the bike ID to the user's bikes array
 * @param userId The ID of the user to associate the bike with
 * @param bikeId The ID of the bike to associate with the user
 */
export async function associateBikeWithUser(userId: string, bikeId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      bikes: arrayUnion(bikeId),
      updatedAt: serverTimestamp()
    });
    console.log(`Bike ${bikeId} successfully associated with user ${userId}`);
  } catch (error) {
    console.error('Error associating bike with user:', error);
    throw error;
  }
}

/**
 * Associates a job with a user by adding the job ID to the user's jobs array
 * @param userId The ID of the user to associate the job with
 * @param jobId The ID of the job to associate with the user
 */
export async function associateJobWithUser(userId: string, jobId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      jobs: arrayUnion(jobId),
      updatedAt: serverTimestamp()
    });
    console.log(`Job ${jobId} successfully associated with user ${userId}`);
  } catch (error) {
    console.error('Error associating job with user:', error);
    throw error;
  }
}

/**
 * Gets all bikes associated with a user based on their role
 * @param userId The ID of the user to get bikes for
 * @returns A promise that resolves to an array of bikes
 */
export async function getUserBikes(userId: string): Promise<Bike[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    const isAdmin = userData.role === 'admin';
    
    // For admins, fetch all bikes
    if (isAdmin) {
      const bikesRef = collection(db, 'bikes');
      const querySnapshot = await getDocs(bikesRef);
      
      const bikes: Bike[] = [];
      querySnapshot.forEach((doc) => {
        bikes.push({ id: doc.id, ...doc.data() } as Bike);
      });
      
      return bikes;
    } 
    // For regular users, only get their bikes
    else {
      const bikes: Bike[] = [];
      
      for (const bikeId of userData.bikes) {
        const bikeDoc = await getDoc(doc(db, 'bikes', bikeId));
        if (bikeDoc.exists()) {
          bikes.push({ id: bikeDoc.id, ...bikeDoc.data() } as Bike);
        }
      }
      
      return bikes;
    }
  } catch (error) {
    console.error('Error getting user bikes:', error);
    throw error;
  }
}

/**
 * Gets all jobs associated with a user based on their role
 * @param userId The ID of the user to get jobs for
 * @returns A promise that resolves to an array of jobs
 */
export async function getUserJobs(userId: string): Promise<Job[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    const isAdmin = userData.role === 'admin';
    
    // For admins, fetch all jobs
    if (isAdmin) {
      const jobsRef = collection(db, 'jobs');
      const querySnapshot = await getDocs(jobsRef);
      
      const jobs: Job[] = [];
      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() } as Job);
      });
      
      return jobs;
    }
    // For regular users, only get their jobs 
    else {
      const jobs: Job[] = [];
      
      for (const jobId of userData.jobs) {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          jobs.push({ id: jobDoc.id, ...jobDoc.data() } as Job);
        }
      }
      
      return jobs;
    }
  } catch (error) {
    console.error('Error getting user jobs:', error);
    throw error;
  }
}

/**
 * Creates a new bike and associates it with a user (Admin only)
 * @param userId The ID of the user to associate the bike with
 * @param bikeData The bike data to create
 * @returns A promise that resolves to the created bike ID
 */
export async function createBikeForUser(userId: string, bikeData: Omit<Bike, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Get user to check if they're an admin
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as User;
    
    // Only allow admins to create bikes
    if (userData.role !== 'admin') {
      throw new Error('Only administrators can create new bikes');
    }
    
    // Create a new bike document with a generated ID
    const bikeRef = doc(db, 'bikes', Date.now().toString());
    const bikeWithMetadata = {
      ...bikeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId // Store the owner of the bike
    };
    
    await setDoc(bikeRef, bikeWithMetadata);
    
    // Associate the bike with the user
    await associateBikeWithUser(userId, bikeRef.id);
    
    return bikeRef.id;
  } catch (error) {
    console.error('Error creating bike for user:', error);
    throw error;
  }
}

/**
 * Creates a new job and associates it with a user
 * @param userId The ID of the user to associate the job with
 * @param jobData The job data to create
 * @returns A promise that resolves to the created job ID
 */
export async function createJobForUser(userId: string, jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Create a new job document with a generated ID
    const jobRef = doc(db, 'jobs', Date.now().toString());
    const jobWithMetadata = {
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId // Store the owner of the job
    };
    
    await setDoc(jobRef, jobWithMetadata);
    
    // Associate the job with the user
    await associateJobWithUser(userId, jobRef.id);
    
    return jobRef.id;
  } catch (error) {
    console.error('Error creating job for user:', error);
    throw error;
  }
}

/**
 * Updates a user's profile information
 * @param userId The ID of the user to update
 * @param profileData The user profile data to update
 * @returns A promise that resolves when the update is complete
 */
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<Pick<User, 'name' | 'email' | 'phone'>>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    console.log(`User ${userId} profile updated successfully`);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Gets a user's profile information
 * @param userId The ID of the user to get
 * @returns A promise that resolves to the user data
 */
export async function getUserProfile(userId: string): Promise<User> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Sets a user as an admin
 * @param userId The ID of the user to set as admin
 * @returns A promise that resolves when the update is complete
 */
export async function setUserAsAdmin(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    
    console.log(`User ${userId} has been set as admin`);
  } catch (error) {
    console.error('Error setting user as admin:', error);
    throw error;
  }
}

/**
 * Creates an admin user account
 * @param email Admin email
 * @param password Admin password
 * @param name Admin name
 * @returns Promise resolving to the created admin user
 */
export async function createAdminAccount(email: string, name: string, userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    
    console.log(`Admin account created for ${email}`);
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
}

/**
 * Gets all available bikes (with status 'available')
 * @returns A promise that resolves to an array of available bikes
 */
export async function getAvailableBikes(): Promise<Bike[]> {
  try {
    // Check if we have a valid Firebase Auth instance
    const auth = getAuth();
    if (!auth.currentUser) {
      console.warn('No authenticated user found when trying to get available bikes');
      return [];
    }

    const bikesRef = collection(db, 'bikes');
    const q = query(bikesRef, where('status', '==', 'available'));
    const bikesSnapshot = await getDocs(q);
    
    const availableBikes: Bike[] = [];
    
    bikesSnapshot.forEach((doc) => {
      availableBikes.push({ id: doc.id, ...doc.data() } as Bike);
    });
    
    return availableBikes;
  } catch (error) {
    console.error('Error getting available bikes:', error);
    throw error;
  }
}

/**
 * Purchases a bike for a user, updating the bike status to 'sold' and associating it with the user
 * @param userId The ID of the user purchasing the bike
 * @param bikeId The ID of the bike being purchased
 * @returns A promise that resolves when the purchase is complete
 */
export async function purchaseBikeForUser(userId: string, bikeId: string): Promise<void> {
  try {
    // Get user and bike data
    const userRef = doc(db, 'users', userId);
    const bikeRef = doc(db, 'bikes', bikeId);
    
    const userDoc = await getDoc(userRef);
    const bikeDoc = await getDoc(bikeRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    if (!bikeDoc.exists()) {
      throw new Error('Bike not found');
    }
    
    const bikeData = bikeDoc.data() as Bike;
    
    // Check if bike is available
    if (bikeData.status !== 'available') {
      throw new Error('This bike is not available for purchase');
    }
    
    // Update bike status to sold and assign to user
    await updateDoc(bikeRef, {
      status: 'sold',
      clientId: userId,
      updatedAt: serverTimestamp()
    });
    
    // Associate bike with user
    await associateBikeWithUser(userId, bikeId);
    
    console.log(`Bike ${bikeId} successfully purchased by user ${userId}`);
    return;
  } catch (error) {
    console.error('Error purchasing bike for user:', error);
    throw error;
  }
} 