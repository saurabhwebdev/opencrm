import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // For development, disable email confirmation
          data: {
            confirm: true
          }
        }
      });

      if (error) throw error;

      // For development, automatically sign in after signup
      if (data?.user) {
        await signIn(email, password);
        return {
          data,
          error: null,
          message: 'Account created and logged in successfully!'
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'An error occurred during signup'
        }
      };
    }
  };

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 