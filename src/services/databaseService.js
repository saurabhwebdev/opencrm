import { supabase } from './supabase';

export const contactsService = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  add: async (contact) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const contactData = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      title: contact.title,
      address: contact.address,
      notes: contact.notes,
      country_code: contact.country_code,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id, contact) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const contactData = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      title: contact.title,
      address: contact.address,
      notes: contact.notes,
      country_code: contact.country_code,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('contacts')
      .update(contactData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  deleteAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('user_id', user.id);
    
    if (error) throw error;
  }
};

export const tasksService = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  add: async (task) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const taskData = {
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      priority: task.priority,
      status: task.status,
      contact_id: task.contact_id || null,
      contact_name: task.contact_name || null,
      notes: task.notes,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id, task) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const taskData = {
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      priority: task.priority,
      status: task.status,
      contact_id: task.contact_id || null,
      contact_name: task.contact_name || null,
      notes: task.notes,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  deleteAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', user.id);
    
    if (error) throw error;
  }
};

export const interactionsService = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('interactions')
      .select('*, contacts!inner(*)')
      .eq('user_id', user.id)
      .order('interaction_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  add: async (interaction) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const interactionData = {
      contact_id: interaction.contact_id,
      type: interaction.type, // 'meeting', 'call', 'email'
      interaction_date: interaction.interaction_date,
      duration: interaction.duration,
      summary: interaction.summary,
      notes: interaction.notes,
      follow_up_date: interaction.follow_up_date,
      follow_up_notes: interaction.follow_up_notes,
      status: interaction.status, // 'completed', 'needs_follow_up'
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('interactions')
      .insert([interactionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id, interaction) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const interactionData = {
      type: interaction.type,
      interaction_date: interaction.interaction_date,
      duration: interaction.duration,
      summary: interaction.summary,
      notes: interaction.notes,
      follow_up_date: interaction.follow_up_date,
      follow_up_notes: interaction.follow_up_notes,
      status: interaction.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('interactions')
      .update(interactionData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  deleteAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('user_id', user.id);
    
    if (error) throw error;
  }
}; 