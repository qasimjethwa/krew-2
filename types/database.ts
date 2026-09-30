/**
 * Supabase database types for the KREW schema.
 *
 * Mirrors supabase/migrations. After changing the schema, regenerate with:
 *   npm run db:types
 * (which runs `supabase gen types typescript --linked > types/database.ts`).
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GenderIdentity = "woman" | "man" | "non_binary" | "other";
type FitnessLevel = "beginner" | "intermediate" | "advanced";
type TravelRadius = "1_2_km" | "2_5_km" | "5_plus_km";
type GenderPreference = "same_gender" | "no_preference";
type AvailabilitySlot = "morning" | "afternoon" | "evening" | "weekends";
type ConnectionStatus = "pending" | "accepted" | "declined" | "cancelled";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      activities: {
        Row: { slug: string; label: string; sort_order: number; is_active: boolean; created_at: string };
        Insert: { slug: string; label: string; sort_order?: number; is_active?: boolean; created_at?: string };
        Update: { slug?: string; label?: string; sort_order?: number; is_active?: boolean; created_at?: string };
        Relationships: [];
      };
      goals: {
        Row: { slug: string; label: string; sort_order: number; is_active: boolean; created_at: string };
        Insert: { slug: string; label: string; sort_order?: number; is_active?: boolean; created_at?: string };
        Update: { slug?: string; label?: string; sort_order?: number; is_active?: boolean; created_at?: string };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          date_of_birth: string | null;
          gender: GenderIdentity | null;
          bio: string | null;
          avatar_path: string | null;
          external_avatar_url: string | null;
          fitness_level: FitnessLevel | null;
          availability: AvailabilitySlot[];
          gender_preference: GenderPreference | null;
          require_contact_approval: boolean | null;
          custom_activity: string | null;
          custom_goal: string | null;
          email: string | null;
          phone: string | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          gender?: GenderIdentity | null;
          bio?: string | null;
          avatar_path?: string | null;
          external_avatar_url?: string | null;
          fitness_level?: FitnessLevel | null;
          availability?: AvailabilitySlot[];
          gender_preference?: GenderPreference | null;
          require_contact_approval?: boolean | null;
          custom_activity?: string | null;
          custom_goal?: string | null;
          email?: string | null;
          phone?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          date_of_birth?: string | null;
          gender?: GenderIdentity | null;
          bio?: string | null;
          avatar_path?: string | null;
          fitness_level?: FitnessLevel | null;
          availability?: AvailabilitySlot[];
          gender_preference?: GenderPreference | null;
          require_contact_approval?: boolean | null;
          custom_activity?: string | null;
          custom_goal?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      profile_activities: {
        Row: { profile_id: string; activity_slug: string; created_at: string };
        Insert: { profile_id: string; activity_slug: string; created_at?: string };
        Update: { profile_id?: string; activity_slug?: string; created_at?: string };
        Relationships: [
          { foreignKeyName: "profile_activities_activity_slug_fkey"; columns: ["activity_slug"]; isOneToOne: false; referencedRelation: "activities"; referencedColumns: ["slug"] },
          { foreignKeyName: "profile_activities_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      profile_goals: {
        Row: { profile_id: string; goal_slug: string; created_at: string };
        Insert: { profile_id: string; goal_slug: string; created_at?: string };
        Update: { profile_id?: string; goal_slug?: string; created_at?: string };
        Relationships: [
          { foreignKeyName: "profile_goals_goal_slug_fkey"; columns: ["goal_slug"]; isOneToOne: false; referencedRelation: "goals"; referencedColumns: ["slug"] },
          { foreignKeyName: "profile_goals_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      user_locations: {
        Row: {
          user_id: string;
          pincode: string;
          area_name: string | null;
          city: string | null;
          latitude: number;
          longitude: number;
          travel_radius: TravelRadius;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          pincode: string;
          area_name?: string | null;
          city?: string | null;
          latitude: number;
          longitude: number;
          travel_radius: TravelRadius;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pincode?: string;
          area_name?: string | null;
          city?: string | null;
          latitude?: number;
          longitude?: number;
          travel_radius?: TravelRadius;
        };
        Relationships: [
          { foreignKeyName: "user_locations_user_id_fkey"; columns: ["user_id"]; isOneToOne: true; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      profile_contacts: {
        Row: { user_id: string; phone: string | null; instagram: string | null; share_email: boolean; created_at: string; updated_at: string };
        Insert: { user_id: string; phone?: string | null; instagram?: string | null; share_email?: boolean; created_at?: string; updated_at?: string };
        Update: { phone?: string | null; instagram?: string | null; share_email?: boolean };
        Relationships: [
          { foreignKeyName: "profile_contacts_user_id_fkey"; columns: ["user_id"]; isOneToOne: true; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      connections: {
        Row: {
          id: string;
          requester_id: string;
          recipient_id: string;
          status: ConnectionStatus;
          activity_label: string | null;
          created_at: string;
          updated_at: string;
          responded_at: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      skips: {
        Row: { user_id: string; skipped_id: string; created_at: string };
        Insert: { user_id: string; skipped_id: string; created_at?: string };
        Update: { created_at?: string };
        Relationships: [];
      };
      user_roles: {
        Row: { user_id: string; role: "admin"; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      save_activities: { Args: { p_slugs: string[]; p_custom: string | null }; Returns: undefined };
      save_goals_and_schedule: {
        Args: {
          p_goal_slugs: string[];
          p_custom_goal: string | null;
          p_fitness_level: FitnessLevel;
          p_availability: AvailabilitySlot[];
        };
        Returns: undefined;
      };
      complete_onboarding: { Args: Record<PropertyKey, never>; Returns: undefined };
      discover_profiles: {
        Args: {
          p_activity?: string | null;
          p_fitness_level?: FitnessLevel | null;
          p_availability?: AvailabilitySlot | null;
          p_max_km?: number | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          user_id: string;
          full_name: string | null;
          age: number | null;
          avatar_path: string | null;
          external_avatar_url: string | null;
          bio: string | null;
          area_name: string | null;
          city: string | null;
          distance_km: number;
          fitness_level: FitnessLevel | null;
          availability: AvailabilitySlot[];
          activities: Json;
          goals: Json;
          shared_activities: string[];
          match_percent: number;
        }[];
      };
      get_profile: {
        Args: { p_user: string };
        Returns: {
          user_id: string;
          full_name: string | null;
          age: number | null;
          avatar_path: string | null;
          external_avatar_url: string | null;
          bio: string | null;
          area_name: string | null;
          city: string | null;
          distance_km: number | null;
          fitness_level: FitnessLevel | null;
          availability: AvailabilitySlot[];
          activities: Json;
          goals: Json;
          shared_activities: string[];
          match_percent: number | null;
          connection_id: string | null;
          connection_status: "none" | "pending" | "accepted" | "unavailable";
          connection_direction: "sent" | "received" | null;
        }[];
      };
      send_connection: { Args: { p_target: string }; Returns: { connection_id: string; status: ConnectionStatus }[] };
      respond_connection: { Args: { p_connection: string; p_accept: boolean }; Returns: ConnectionStatus };
      cancel_connection: { Args: { p_connection: string }; Returns: undefined };
      list_connections: {
        Args: { p_box: "received" | "sent" | "connected" };
        Returns: {
          connection_id: string;
          status: ConnectionStatus;
          direction: "sent" | "received";
          other_id: string;
          other_name: string | null;
          other_age: number | null;
          other_avatar_path: string | null;
          other_external_avatar_url: string | null;
          area_name: string | null;
          distance_km: number | null;
          activities: Json;
          goals: Json;
          availability: AvailabilitySlot[];
          activity_label: string | null;
          created_at: string;
          responded_at: string | null;
        }[];
      };
      pending_request_count: { Args: Record<PropertyKey, never>; Returns: number };
      get_match: {
        Args: { p_connection: string };
        Returns: {
          connection_id: string;
          my_name: string | null;
          my_avatar_path: string | null;
          my_external_avatar_url: string | null;
          other_id: string;
          other_name: string | null;
          other_age: number | null;
          other_avatar_path: string | null;
          other_external_avatar_url: string | null;
          area_name: string | null;
          distance_km: number | null;
          shared_activities: string[];
          shared_goals: string[];
          shared_availability: AvailabilitySlot[];
          activity_label: string | null;
          contact_phone: string | null;
          contact_instagram: string | null;
          contact_email: string | null;
          connected_at: string | null;
        }[];
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      gender_identity: GenderIdentity;
      fitness_level: FitnessLevel;
      travel_radius: TravelRadius;
      gender_preference: GenderPreference;
      availability_slot: AvailabilitySlot;
      connection_status: ConnectionStatus;
      app_role: "admin";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
export type RpcReturn<T extends keyof PublicSchema["Functions"]> = PublicSchema["Functions"][T]["Returns"];
