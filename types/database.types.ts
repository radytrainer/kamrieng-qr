/**
 * Supabase database types, hand-authored to match `supabase/migrations/*`.
 *
 * Once the migrations are applied to the live project, regenerate the
 * authoritative version and replace this file:
 *
 *   npx supabase login
 *   npx supabase link --project-ref <your-project-ref>
 *   npx supabase gen types typescript --linked > types/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      roles: Table<
        {
          code: string;
          name: string;
          description: string | null;
          created_at: string;
        },
        {
          code: string;
          name: string;
          description?: string | null;
          created_at?: string;
        }
      >;

      permissions: Table<
        {
          code: string;
          description: string | null;
          created_at: string;
        },
        {
          code: string;
          description?: string | null;
          created_at?: string;
        }
      >;

      role_permissions: Table<
        {
          role_code: string;
          permission_code: string;
          created_at: string;
        },
        {
          role_code: string;
          permission_code: string;
          created_at?: string;
        }
      >;

      users: Table<
        {
          id: string;
          firebase_uid: string | null;
          email: string;
          display_name: string | null;
          photo_url: string | null;
          role_code: string;
          teacher_id: string | null;
          student_id: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          firebase_uid?: string | null;
          email: string;
          display_name?: string | null;
          photo_url?: string | null;
          role_code: string;
          teacher_id?: string | null;
          student_id?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;

      departments: Table<
        {
          id: string;
          code: string;
          name_en: string;
          name_km: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          code: string;
          name_en: string;
          name_km?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;

      study_programs: Table<
        {
          id: string;
          department_id: string;
          code: string;
          name_en: string;
          name_km: string | null;
          degree: string;
          credits_required: number | null;
          duration_years: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          department_id: string;
          code: string;
          name_en: string;
          name_km?: string | null;
          degree?: string;
          credits_required?: number | null;
          duration_years?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;

      teachers: Table<
        {
          id: string;
          teacher_code: string;
          teacher_token: string;
          photo_url: string | null;
          khmer_first_name: string;
          khmer_last_name: string;
          english_first_name: string;
          english_last_name: string;
          gender: string;
          date_of_birth: string | null;
          phone: string | null;
          email: string | null;
          department_id: string | null;
          position: string | null;
          hire_date: string | null;
          is_active: boolean;
          issue_date: string | null;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          teacher_code?: string;
          teacher_token?: string;
          photo_url?: string | null;
          khmer_first_name: string;
          khmer_last_name: string;
          english_first_name: string;
          english_last_name: string;
          gender: string;
          date_of_birth?: string | null;
          phone?: string | null;
          email?: string | null;
          department_id?: string | null;
          position?: string | null;
          hire_date?: string | null;
          is_active?: boolean;
          issue_date?: string | null;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;

      academic_years: Table<
        {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;

      classes: Table<
        {
          id: string;
          academic_year_id: string;
          department_id: string | null;
          study_program_id: string | null;
          homeroom_teacher_id: string | null;
          name: string;
          grade_level: number | null;
          capacity: number | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          academic_year_id: string;
          department_id?: string | null;
          study_program_id?: string | null;
          homeroom_teacher_id?: string | null;
          name: string;
          grade_level?: number | null;
          capacity?: number | null;
          created_at?: string;
          updated_at?: string;
        }
      >;

      addresses: Table<
        {
          id: string;
          parent_id: string | null;
          level: string;
          code: string | null;
          name_en: string;
          name_km: string | null;
          created_at: string;
        },
        {
          id?: string;
          parent_id?: string | null;
          level: string;
          code?: string | null;
          name_en: string;
          name_km?: string | null;
          created_at?: string;
        }
      >;

      student_status: Table<
        {
          code: string;
          label_en: string;
          label_km: string | null;
          is_terminal: boolean;
          created_at: string;
        },
        {
          code: string;
          label_en: string;
          label_km?: string | null;
          is_terminal?: boolean;
          created_at?: string;
        }
      >;

      students: Table<
        {
          id: string;
          student_code: string;
          student_token: string;
          photo_url: string | null;
          khmer_first_name: string;
          khmer_last_name: string;
          english_first_name: string;
          english_last_name: string;
          gender: string;
          date_of_birth: string;
          place_of_birth: string | null;
          nationality: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          province: string | null;
          district: string | null;
          commune: string | null;
          village: string | null;
          department_id: string | null;
          study_program_id: string | null;
          class_id: string | null;
          academic_year_id: string | null;
          study_year: number | null;
          semester: number | null;
          gpa: number | null;
          credits_earned: number;
          status: string;
          issue_date: string | null;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_code?: string;
          student_token?: string;
          photo_url?: string | null;
          khmer_first_name: string;
          khmer_last_name: string;
          english_first_name: string;
          english_last_name: string;
          gender: string;
          date_of_birth: string;
          place_of_birth?: string | null;
          nationality?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          province?: string | null;
          district?: string | null;
          commune?: string | null;
          village?: string | null;
          department_id?: string | null;
          study_program_id?: string | null;
          class_id?: string | null;
          academic_year_id?: string | null;
          study_year?: number | null;
          semester?: number | null;
          gpa?: number | null;
          credits_earned?: number;
          status?: string;
          issue_date?: string | null;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;

      parents: Table<
        {
          id: string;
          khmer_name: string | null;
          english_name: string;
          relationship: string;
          phone: string | null;
          email: string | null;
          occupation: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          khmer_name?: string | null;
          english_name: string;
          relationship: string;
          phone?: string | null;
          email?: string | null;
          occupation?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;

      student_parents: Table<
        {
          student_id: string;
          parent_id: string;
          is_emergency_contact: boolean;
          created_at: string;
        },
        {
          student_id: string;
          parent_id: string;
          is_emergency_contact?: boolean;
          created_at?: string;
        }
      >;

      student_cards: Table<
        {
          id: string;
          student_id: string;
          card_number: string;
          issue_date: string;
          expiry_date: string;
          status: string;
          template_version: string;
          printed_at: string | null;
          printed_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          student_id: string;
          card_number: string;
          issue_date?: string;
          expiry_date: string;
          status?: string;
          template_version?: string;
          printed_at?: string | null;
          printed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;

      attendance: Table<
        {
          id: string;
          student_id: string;
          class_id: string | null;
          teacher_id: string | null;
          academic_year_id: string | null;
          attendance_date: string;
          check_in_time: string;
          status: string;
          method: string;
          device_info: string | null;
          latitude: number | null;
          longitude: number | null;
          notes: string | null;
          created_at: string;
        },
        {
          id?: string;
          student_id: string;
          class_id?: string | null;
          teacher_id?: string | null;
          academic_year_id?: string | null;
          attendance_date?: string;
          check_in_time?: string;
          status?: string;
          method?: string;
          device_info?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          notes?: string | null;
          created_at?: string;
        }
      >;

      activity_logs: Table<
        {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        }
      >;

      school_settings: Table<
        {
          id: boolean;
          card_issue_buddhist_line: string;
          card_issue_gregorian_line: string;
          updated_at: string;
        },
        {
          id?: boolean;
          card_issue_buddhist_line: string;
          card_issue_gregorian_line: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_charts: {
        Args: Record<string, never>;
        Returns: Json;
      };
      generate_student_token: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_student_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_teacher_token: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_app_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_app_user_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
