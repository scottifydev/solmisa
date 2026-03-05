export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string;
          axis_impacts: Json | null;
          created_at: string | null;
          duration_minutes: number | null;
          id: string;
          notes: string | null;
          user_id: string;
        };
        Insert: {
          activity_type: string;
          axis_impacts?: Json | null;
          created_at?: string | null;
          duration_minutes?: number | null;
          id?: string;
          notes?: string | null;
          user_id: string;
        };
        Update: {
          activity_type?: string;
          axis_impacts?: Json | null;
          created_at?: string | null;
          duration_minutes?: number | null;
          id?: string;
          notes?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_questions: {
        Row: {
          axis_weights: Json;
          category: string;
          display_order: number | null;
          id: string;
          is_onboarding: boolean;
          options: Json;
          question_text: string;
        };
        Insert: {
          axis_weights: Json;
          category: string;
          display_order?: number | null;
          id?: string;
          is_onboarding?: boolean;
          options: Json;
          question_text: string;
        };
        Update: {
          axis_weights?: Json;
          category?: string;
          display_order?: number | null;
          id?: string;
          is_onboarding?: boolean;
          options?: Json;
          question_text?: string;
        };
        Relationships: [];
      };
      assessment_responses: {
        Row: {
          created_at: string | null;
          id: string;
          question_id: string;
          selected_option: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          question_id: string;
          selected_option: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          question_id?: string;
          selected_option?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_responses_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "assessment_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_responses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      card_instances: {
        Row: {
          answer_data: Json;
          audio_ref: string | null;
          created_at: string | null;
          id: string;
          instance_parameters: Json | null;
          options_data: Json | null;
          prompt_rendered: string;
          template_id: string;
        };
        Insert: {
          answer_data: Json;
          audio_ref?: string | null;
          created_at?: string | null;
          id?: string;
          instance_parameters?: Json | null;
          options_data?: Json | null;
          prompt_rendered: string;
          template_id: string;
        };
        Update: {
          answer_data?: Json;
          audio_ref?: string | null;
          created_at?: string | null;
          id?: string;
          instance_parameters?: Json | null;
          options_data?: Json | null;
          prompt_rendered?: string;
          template_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "card_instances_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "card_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      card_templates: {
        Row: {
          block_scoring: Json | null;
          card_category: string;
          created_at: string | null;
          difficulty_tiers: Json;
          dimensions: string[] | null;
          feedback: Json | null;
          id: string;
          is_parametric: boolean | null;
          lesson_id: string | null;
          parameters: Json | null;
          playback: Json | null;
          prompt_audio: Json | null;
          prompt_text: string;
          response_type: string;
          slug: string;
        };
        Insert: {
          block_scoring?: Json | null;
          card_category?: string;
          created_at?: string | null;
          difficulty_tiers?: Json;
          dimensions?: string[] | null;
          feedback?: Json | null;
          id?: string;
          is_parametric?: boolean | null;
          lesson_id?: string | null;
          parameters?: Json | null;
          playback?: Json | null;
          prompt_audio?: Json | null;
          prompt_text: string;
          response_type: string;
          slug: string;
        };
        Update: {
          block_scoring?: Json | null;
          card_category?: string;
          created_at?: string | null;
          difficulty_tiers?: Json;
          dimensions?: string[] | null;
          feedback?: Json | null;
          id?: string;
          is_parametric?: boolean | null;
          lesson_id?: string | null;
          parameters?: Json | null;
          playback?: Json | null;
          prompt_audio?: Json | null;
          prompt_text?: string;
          response_type?: string;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "card_templates_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_progress: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          current_stage_index: number | null;
          id: string;
          lesson_id: string;
          score: number | null;
          started_at: string | null;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          current_stage_index?: number | null;
          id?: string;
          lesson_id: string;
          score?: number | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          current_stage_index?: number | null;
          id?: string;
          lesson_id?: string;
          score?: number | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          created_at: string | null;
          description: string | null;
          drone_key: string;
          id: string;
          lesson_order: number;
          module_id: string;
          stages: Json;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          drone_key?: string;
          id?: string;
          lesson_order: number;
          module_id: string;
          stages?: Json;
          title: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          drone_key?: string;
          id?: string;
          lesson_order?: number;
          module_id?: string;
          stages?: Json;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      module_progress: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          id: string;
          lessons_completed: number | null;
          module_id: string;
          status: string;
          unlocked_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          lessons_completed?: number | null;
          module_id: string;
          status?: string;
          unlocked_at?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          lessons_completed?: number | null;
          module_id?: string;
          status?: string;
          unlocked_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "module_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          module_order: number;
          title: string;
          unlock_criteria: Json | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          module_order: number;
          title: string;
          unlock_criteria?: Json | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          module_order?: number;
          title?: string;
          unlock_criteria?: Json | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          experience_level: string | null;
          goals: string[] | null;
          id: string;
          instrument: string | null;
          musical_background: string | null;
          name: string | null;
          onboarding_complete: boolean | null;
          primary_solfege_system: string | null;
          streak_days: number | null;
          streak_last_date: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          experience_level?: string | null;
          goals?: string[] | null;
          id: string;
          instrument?: string | null;
          musical_background?: string | null;
          name?: string | null;
          onboarding_complete?: boolean | null;
          primary_solfege_system?: string | null;
          streak_days?: number | null;
          streak_last_date?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          experience_level?: string | null;
          goals?: string[] | null;
          id?: string;
          instrument?: string | null;
          musical_background?: string | null;
          name?: string | null;
          onboarding_complete?: boolean | null;
          primary_solfege_system?: string | null;
          streak_days?: number | null;
          streak_last_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      review_records: {
        Row: {
          correct: boolean;
          created_at: string | null;
          id: string;
          response: Json;
          response_time_ms: number | null;
          srs_stage_after: string | null;
          srs_stage_before: string | null;
          user_card_state_id: string;
        };
        Insert: {
          correct: boolean;
          created_at?: string | null;
          id?: string;
          response: Json;
          response_time_ms?: number | null;
          srs_stage_after?: string | null;
          srs_stage_before?: string | null;
          user_card_state_id: string;
        };
        Update: {
          correct?: boolean;
          created_at?: string | null;
          id?: string;
          response?: Json;
          response_time_ms?: number | null;
          srs_stage_after?: string | null;
          srs_stage_before?: string | null;
          user_card_state_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_records_user_card_state_id_fkey";
            columns: ["user_card_state_id"];
            isOneToOne: false;
            referencedRelation: "user_card_state";
            referencedColumns: ["id"];
          },
        ];
      };
      skill_axes: {
        Row: {
          axis_name: string;
          id: string;
          score: number | null;
          source: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          axis_name: string;
          id?: string;
          score?: number | null;
          source?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          axis_name?: string;
          id?: string;
          score?: number | null;
          source?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "skill_axes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_card_state: {
        Row: {
          card_instance_id: string;
          correct_streak: number | null;
          created_at: string | null;
          difficulty_tier: string | null;
          dimension_accuracy: Json | null;
          ease_factor: number | null;
          id: string;
          interval_days: number | null;
          next_review_at: string | null;
          srs_stage: string;
          total_correct: number | null;
          total_reviews: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          card_instance_id: string;
          correct_streak?: number | null;
          created_at?: string | null;
          difficulty_tier?: string | null;
          dimension_accuracy?: Json | null;
          ease_factor?: number | null;
          id?: string;
          interval_days?: number | null;
          next_review_at?: string | null;
          srs_stage?: string;
          total_correct?: number | null;
          total_reviews?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          card_instance_id?: string;
          correct_streak?: number | null;
          created_at?: string | null;
          difficulty_tier?: string | null;
          dimension_accuracy?: Json | null;
          ease_factor?: number | null;
          id?: string;
          interval_days?: number | null;
          next_review_at?: string | null;
          srs_stage?: string;
          total_correct?: number | null;
          total_reviews?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_card_state_card_instance_id_fkey";
            columns: ["card_instance_id"];
            isOneToOne: false;
            referencedRelation: "card_instances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_card_state_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      process_review_answer: {
        Args: {
          p_correct: boolean;
          p_dimension_accuracy?: Json;
          p_new_difficulty_tier?: string;
          p_new_ease_factor: number;
          p_new_interval_days: number;
          p_new_stage: string;
          p_next_review_at: string;
          p_response: Json;
          p_response_time_ms: number;
          p_user_card_state_id: string;
        };
        Returns: Json;
      };
      seed_lesson_cards: {
        Args: { p_card_data: Json; p_lesson_id: string; p_user_id: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;
