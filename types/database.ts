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
          radar_dimensions: string[] | null;
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
          radar_dimensions?: string[] | null;
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
          radar_dimensions?: string[] | null;
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
      drills: {
        Row: {
          config: Json;
          created_at: string | null;
          description: string | null;
          difficulty_range: string[] | null;
          display_order: number | null;
          drill_type: string;
          id: string;
          slug: string;
          title: string;
          track_id: string;
        };
        Insert: {
          config?: Json;
          created_at?: string | null;
          description?: string | null;
          difficulty_range?: string[] | null;
          display_order?: number | null;
          drill_type: string;
          id?: string;
          slug: string;
          title: string;
          track_id: string;
        };
        Update: {
          config?: Json;
          created_at?: string | null;
          description?: string | null;
          difficulty_range?: string[] | null;
          display_order?: number | null;
          drill_type?: string;
          id?: string;
          slug?: string;
          title?: string;
          track_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drills_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "skill_tracks";
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
          soft_prerequisites: Json | null;
          stages: Json;
          title: string;
          track_id: string;
          unlocks_cards: string[] | null;
          unlocks_drills: string[] | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          drone_key?: string;
          id?: string;
          lesson_order: number;
          module_id: string;
          soft_prerequisites?: Json | null;
          stages?: Json;
          title: string;
          track_id: string;
          unlocks_cards?: string[] | null;
          unlocks_drills?: string[] | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          drone_key?: string;
          id?: string;
          lesson_order?: number;
          module_id?: string;
          soft_prerequisites?: Json | null;
          stages?: Json;
          title?: string;
          track_id?: string;
          unlocks_cards?: string[] | null;
          unlocks_drills?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "skill_tracks";
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
          track_id: string;
          unlock_criteria: Json | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          module_order: number;
          title: string;
          track_id: string;
          unlock_criteria?: Json | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          module_order?: number;
          title?: string;
          track_id?: string;
          unlock_criteria?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "modules_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "skill_tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_results: {
        Row: {
          confidence: number | null;
          created_at: string | null;
          dimension: string;
          estimated_level: string;
          id: string;
          raw_responses: Json | null;
          track_id: string;
          user_id: string;
        };
        Insert: {
          confidence?: number | null;
          created_at?: string | null;
          dimension: string;
          estimated_level: string;
          id?: string;
          raw_responses?: Json | null;
          track_id: string;
          user_id: string;
        };
        Update: {
          confidence?: number | null;
          created_at?: string | null;
          dimension?: string;
          estimated_level?: string;
          id?: string;
          raw_responses?: Json | null;
          track_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_results_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "skill_tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "onboarding_results_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      practice_recommendations: {
        Row: {
          created_at: string | null;
          description: string | null;
          dimension: string;
          display_order: number | null;
          id: string;
          level: string;
          tool_name: string;
          tool_type: string;
          tool_url: string | null;
          track_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          dimension: string;
          display_order?: number | null;
          id?: string;
          level: string;
          tool_name: string;
          tool_type: string;
          tool_url?: string | null;
          track_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          dimension?: string;
          display_order?: number | null;
          id?: string;
          level?: string;
          tool_name?: string;
          tool_type?: string;
          tool_url?: string | null;
          track_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "practice_recommendations_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "skill_tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          cat_state: Json | null;
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
          cat_state?: Json | null;
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
          cat_state?: Json | null;
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
      radar_cache: {
        Row: {
          computed_at: string | null;
          dimension: string;
          id: string;
          score: number;
          total_reviews: number | null;
          user_id: string;
        };
        Insert: {
          computed_at?: string | null;
          dimension: string;
          id?: string;
          score?: number;
          total_reviews?: number | null;
          user_id: string;
        };
        Update: {
          computed_at?: string | null;
          dimension?: string;
          id?: string;
          score?: number;
          total_reviews?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "radar_cache_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      review_records: {
        Row: {
          correct: boolean;
          created_at: string | null;
          id: string;
          radar_dimensions: string[] | null;
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
          radar_dimensions?: string[] | null;
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
          radar_dimensions?: string[] | null;
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
      skill_tracks: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number;
          icon: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order: number;
          icon?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      track_progress: {
        Row: {
          current_module_id: string | null;
          id: string;
          lessons_completed: number | null;
          started_at: string | null;
          track_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          current_module_id?: string | null;
          id?: string;
          lessons_completed?: number | null;
          started_at?: string | null;
          track_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          current_module_id?: string | null;
          id?: string;
          lessons_completed?: number | null;
          started_at?: string | null;
          track_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "track_progress_current_module_id_fkey";
            columns: ["current_module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "track_progress_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "skill_tracks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "track_progress_user_id_fkey";
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
      reconcile_lesson_cards: { Args: { p_user_id?: string }; Returns: Json };
      seed_lesson_cards: {
        Args: { p_card_data: Json; p_lesson_id: string; p_user_id: string };
        Returns: Json;
      };
      seed_lesson_cards_v2: {
        Args: {
          p_initial_interval_override?: string;
          p_lesson_id: string;
          p_user_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      card_category: "perceptual" | "declarative";
      experience_level: "beginner" | "intermediate" | "advanced";
      lesson_stage_type:
        | "aural_teach"
        | "theory_teach"
        | "aural_quiz"
        | "theory_quiz"
        | "practice";
      review_result: "correct" | "incorrect" | "skip";
      srs_stage:
        | "apprentice"
        | "journeyman"
        | "adept"
        | "virtuoso"
        | "mastered";
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      card_category: ["perceptual", "declarative"],
      experience_level: ["beginner", "intermediate", "advanced"],
      lesson_stage_type: [
        "aural_teach",
        "theory_teach",
        "aural_quiz",
        "theory_quiz",
        "practice",
      ],
      review_result: ["correct", "incorrect", "skip"],
      srs_stage: ["apprentice", "journeyman", "adept", "virtuoso", "mastered"],
    },
  },
} as const;
