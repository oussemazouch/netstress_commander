-- Location: supabase/migrations/20250811145220_netstress_commander_platform.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete new system
-- Dependencies: none - creating complete schema from scratch

-- 1. Custom Types
CREATE TYPE public.user_role AS ENUM ('admin', 'operator', 'viewer');
CREATE TYPE public.attack_type AS ENUM ('get_flooding', 'post_flooding', 'icmp_flooding', 'slowloris', 'syn_flood');
CREATE TYPE public.attack_status AS ENUM ('queued', 'running', 'paused', 'completed', 'failed', 'stopped');
CREATE TYPE public.node_status AS ENUM ('online', 'offline', 'busy', 'maintenance');
CREATE TYPE public.target_type AS ENUM ('web_server', 'api', 'database', 'network_device', 'cdn');
CREATE TYPE public.activity_type AS ENUM ('attack_started', 'attack_completed', 'attack_paused', 'attack_stopped', 'attack_failed', 'node_connected', 'node_disconnected', 'config_updated');

-- 2. Core User Table (intermediary for auth relationships)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'operator'::public.user_role,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Attack Nodes (Infrastructure)
CREATE TABLE public.attack_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    ip_address INET NOT NULL,
    status public.node_status DEFAULT 'offline'::public.node_status,
    cpu_usage INTEGER DEFAULT 0 CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
    memory_usage INTEGER DEFAULT 0 CHECK (memory_usage >= 0 AND memory_usage <= 100),
    active_attacks_count INTEGER DEFAULT 0 CHECK (active_attacks_count >= 0),
    max_concurrent_attacks INTEGER DEFAULT 5 CHECK (max_concurrent_attacks > 0),
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attack Templates
CREATE TABLE public.attack_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    attack_type public.attack_type NOT NULL,
    target_type public.target_type NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('low', 'medium', 'high')),
    estimated_duration_min INTEGER CHECK (estimated_duration_min > 0),
    estimated_duration_max INTEGER CHECK (estimated_duration_max > 0),
    default_parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Attack Campaigns (Main entity)
CREATE TABLE public.attack_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_host TEXT NOT NULL,
    target_type public.target_type NOT NULL,
    attack_type public.attack_type NOT NULL,
    status public.attack_status DEFAULT 'queued'::public.attack_status,
    template_id UUID REFERENCES public.attack_templates(id) ON DELETE SET NULL,
    parameters JSONB DEFAULT '{}',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    assigned_nodes UUID[] DEFAULT '{}',
    total_requests BIGINT DEFAULT 0,
    successful_requests BIGINT DEFAULT 0,
    failed_requests BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT valid_duration CHECK (duration_seconds >= 0),
    CONSTRAINT valid_requests CHECK (
        total_requests >= 0 AND 
        successful_requests >= 0 AND 
        failed_requests >= 0 AND
        (successful_requests + failed_requests) <= total_requests
    )
);

-- 6. Attack Metrics (Time series data)
CREATE TABLE public.attack_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.attack_campaigns(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    requests_per_second INTEGER DEFAULT 0,
    response_time_ms NUMERIC(10,2) DEFAULT 0,
    success_rate NUMERIC(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
    error_count INTEGER DEFAULT 0,
    cpu_usage INTEGER DEFAULT 0 CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
    memory_usage INTEGER DEFAULT 0 CHECK (memory_usage >= 0 AND memory_usage <= 100),
    network_throughput_mbps NUMERIC(10,2) DEFAULT 0
);

-- 7. Activity Logs
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.activity_type NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.attack_campaigns(id) ON DELETE SET NULL,
    node_id UUID REFERENCES public.attack_nodes(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_attack_nodes_status ON public.attack_nodes(status);
CREATE INDEX idx_attack_nodes_location ON public.attack_nodes(location);
CREATE INDEX idx_attack_templates_type ON public.attack_templates(attack_type);
CREATE INDEX idx_attack_templates_active ON public.attack_templates(is_active);
CREATE INDEX idx_attack_campaigns_status ON public.attack_campaigns(status);
CREATE INDEX idx_attack_campaigns_created_by ON public.attack_campaigns(created_by);
CREATE INDEX idx_attack_campaigns_type ON public.attack_campaigns(attack_type);
CREATE INDEX idx_attack_metrics_campaign_id ON public.attack_metrics(campaign_id);
CREATE INDEX idx_attack_metrics_timestamp ON public.attack_metrics(timestamp);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(type);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- 9. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attack_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attack_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attack_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attack_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 10. Helper Functions (before RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role::TEXT = required_role
    AND up.is_active = true
)
$$;

-- 11. RLS Policies

-- Pattern 1: Core user table (user_profiles) - Simple only
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 4: Public read for nodes, admin manage
CREATE POLICY "authenticated_users_read_attack_nodes"
ON public.attack_nodes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manage_attack_nodes"
ON public.attack_nodes
FOR ALL
TO authenticated
USING (public.has_role('admin'))
WITH CHECK (public.has_role('admin'));

-- Pattern 4: Public read for templates, creators and admins manage
CREATE POLICY "authenticated_users_read_attack_templates"
ON public.attack_templates
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "users_manage_own_attack_templates"
ON public.attack_templates
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR public.has_role('admin'))
WITH CHECK (created_by = auth.uid() OR public.has_role('admin'));

-- Pattern 2: Simple user ownership for campaigns
CREATE POLICY "users_manage_own_attack_campaigns"
ON public.attack_campaigns
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR public.has_role('admin'))
WITH CHECK (created_by = auth.uid());

-- Pattern 7: Complex relationship for metrics (campaign ownership)
CREATE OR REPLACE FUNCTION public.can_access_campaign_metrics(campaign_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.attack_campaigns ac
    WHERE ac.id = campaign_uuid
    AND (ac.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role IN ('admin', 'operator')
    ))
)
$$;

CREATE POLICY "users_access_campaign_metrics"
ON public.attack_metrics
FOR SELECT
TO authenticated
USING (public.can_access_campaign_metrics(campaign_id));

CREATE POLICY "system_insert_attack_metrics"
ON public.attack_metrics
FOR INSERT
TO authenticated
WITH CHECK (public.can_access_campaign_metrics(campaign_id));

-- Pattern 4: Public read activity logs, system creates
CREATE POLICY "authenticated_users_read_activity_logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "system_create_activity_logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role('admin'));

-- 12. Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operator')::public.user_role
  );
  RETURN NEW;
END;
$$;

-- 13. Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Apply timestamp triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attack_nodes_updated_at
    BEFORE UPDATE ON public.attack_nodes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attack_templates_updated_at
    BEFORE UPDATE ON public.attack_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attack_campaigns_updated_at
    BEFORE UPDATE ON public.attack_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Complete Mock Data with Dependencies
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    operator_uuid UUID := gen_random_uuid();
    node1_uuid UUID := gen_random_uuid();
    node2_uuid UUID := gen_random_uuid();
    node3_uuid UUID := gen_random_uuid();
    template1_uuid UUID := gen_random_uuid();
    template2_uuid UUID := gen_random_uuid();
    template3_uuid UUID := gen_random_uuid();
    template4_uuid UUID := gen_random_uuid();
    campaign1_uuid UUID := gen_random_uuid();
    campaign2_uuid UUID := gen_random_uuid();
    campaign3_uuid UUID := gen_random_uuid();
    campaign4_uuid UUID := gen_random_uuid();
    campaign5_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete field structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@netstress.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Security Admin", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (operator_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'operator@netstress.com', crypt('operator123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Test Operator", "role": "operator"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Insert attack nodes
    INSERT INTO public.attack_nodes (id, name, location, ip_address, status, cpu_usage, active_attacks_count, last_heartbeat) VALUES
        (node1_uuid, 'Node-US-East-1', 'Virginia, USA', '10.0.1.10'::inet, 'online'::public.node_status, 45, 2, now() - interval '30 seconds'),
        (node2_uuid, 'Node-EU-West-1', 'Ireland, EU', '10.0.2.10'::inet, 'busy'::public.node_status, 89, 3, now() - interval '15 seconds'),
        (node3_uuid, 'Node-AP-South-1', 'Mumbai, India', '10.0.3.10'::inet, 'online'::public.node_status, 23, 1, now() - interval '5 seconds'),
        (gen_random_uuid(), 'Node-US-West-2', 'Oregon, USA', '10.0.4.10'::inet, 'offline'::public.node_status, 0, 0, now() - interval '10 minutes'),
        (gen_random_uuid(), 'Node-EU-Central-1', 'Frankfurt, Germany', '10.0.5.10'::inet, 'online'::public.node_status, 67, 2, now() - interval '1 minute'),
        (gen_random_uuid(), 'Node-AP-Northeast-1', 'Tokyo, Japan', '10.0.6.10'::inet, 'maintenance'::public.node_status, 15, 0, now() - interval '2 hours');

    -- Insert attack templates
    INSERT INTO public.attack_templates (id, name, description, attack_type, target_type, category, difficulty, estimated_duration_min, estimated_duration_max, created_by, default_parameters) VALUES
        (template1_uuid, 'GET Flooding', 'High-volume GET request flooding to test web server capacity and response times under load.', 'get_flooding'::public.attack_type, 'web_server'::public.target_type, 'HTTP Stress', 'low', 5, 15, admin_uuid, '{"requests_per_second": 1000, "timeout": 30}'::jsonb),
        (template2_uuid, 'POST Flooding', 'POST request flooding with payload data to simulate form submission attacks and API stress.', 'post_flooding'::public.attack_type, 'api'::public.target_type, 'HTTP Stress', 'medium', 10, 30, admin_uuid, '{"requests_per_second": 500, "payload_size": 1024}'::jsonb),
        (template3_uuid, 'Slowloris', 'Slow HTTP attack maintaining connections to exhaust server connection pools.', 'slowloris'::public.attack_type, 'web_server'::public.target_type, 'Connection Attack', 'high', 30, 60, admin_uuid, '{"connections": 200, "delay": 10}'::jsonb),
        (template4_uuid, 'ICMP Flooding', 'Network layer flooding using ICMP packets to test network infrastructure resilience.', 'icmp_flooding'::public.attack_type, 'network_device'::public.target_type, 'Network Layer', 'medium', 5, 20, admin_uuid, '{"packet_size": 64, "interval": 0.01}'::jsonb);

    -- Insert attack campaigns
    INSERT INTO public.attack_campaigns (id, name, target_host, target_type, attack_type, status, template_id, progress, duration_seconds, started_at, created_by, assigned_nodes, total_requests, successful_requests, failed_requests) VALUES
        (campaign1_uuid, 'Production Load Test', '192.168.1.100', 'web_server'::public.target_type, 'get_flooding'::public.attack_type, 'running'::public.attack_status, template1_uuid, 75, 1847, now() - interval '30 minutes', admin_uuid, ARRAY[node1_uuid, node2_uuid], 150000, 142500, 7500),
        (campaign2_uuid, 'API Stress Test', 'api.example.com', 'api'::public.target_type, 'post_flooding'::public.attack_type, 'running'::public.attack_status, template2_uuid, 45, 923, now() - interval '15 minutes', admin_uuid, ARRAY[node1_uuid], 75000, 71250, 3750),
        (campaign3_uuid, 'Network Resilience', '10.0.0.50', 'network_device'::public.target_type, 'icmp_flooding'::public.attack_type, 'completed'::public.attack_status, template4_uuid, 100, 3600, now() - interval '1 hour', admin_uuid, ARRAY[node3_uuid], 500000, 492500, 7500),
        (campaign4_uuid, 'Connection Pool Test', 'db.internal.com', 'database'::public.target_type, 'slowloris'::public.attack_type, 'paused'::public.attack_status, template3_uuid, 30, 456, now() - interval '8 minutes', operator_uuid, ARRAY[node2_uuid], 25000, 22500, 2500),
        (campaign5_uuid, 'CDN Performance', 'cdn.example.com', 'cdn'::public.target_type, 'syn_flood'::public.attack_type, 'queued'::public.attack_status, null, 0, 0, null, operator_uuid, '{}', 0, 0, 0);

    -- Insert activity logs
    INSERT INTO public.activity_logs (type, message, user_id, campaign_id, created_at) VALUES
        ('attack_started'::public.activity_type, 'Production Load Test attack initiated on 192.168.1.100', admin_uuid, campaign1_uuid, now() - interval '5 minutes'),
        ('attack_completed'::public.activity_type, 'Network Resilience test completed successfully with 98.5% success rate', admin_uuid, campaign3_uuid, now() - interval '10 minutes'),
        ('node_connected'::public.activity_type, 'Attack node Node-EU-West-3 connected from London datacenter', admin_uuid, null, now() - interval '15 minutes'),
        ('attack_paused'::public.activity_type, 'Connection Pool Test paused due to high target server load', operator_uuid, campaign4_uuid, now() - interval '20 minutes'),
        ('config_updated'::public.activity_type, 'Attack template Slowloris Advanced configuration updated', admin_uuid, null, now() - interval '30 minutes');

    -- Insert sample metrics
    INSERT INTO public.attack_metrics (campaign_id, timestamp, requests_per_second, response_time_ms, success_rate, error_count) VALUES
        (campaign1_uuid, now() - interval '10 minutes', 850, 125.5, 95.2, 15),
        (campaign1_uuid, now() - interval '5 minutes', 920, 132.1, 94.8, 18),
        (campaign1_uuid, now() - interval '1 minute', 1050, 145.3, 93.5, 22),
        (campaign2_uuid, now() - interval '8 minutes', 450, 89.2, 97.1, 8),
        (campaign2_uuid, now() - interval '3 minutes', 520, 95.8, 96.8, 12),
        (campaign3_uuid, now() - interval '1 hour', 2500, 15.2, 98.5, 5);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during mock data insertion: %', SQLERRM;
END $$;

-- 16. Cleanup function for testing
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs first
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%netstress.com';

    -- Delete in dependency order (children first)
    DELETE FROM public.attack_metrics WHERE campaign_id IN (
        SELECT id FROM public.attack_campaigns WHERE created_by = ANY(auth_user_ids_to_delete)
    );
    DELETE FROM public.activity_logs WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.attack_campaigns WHERE created_by = ANY(auth_user_ids_to_delete);
    DELETE FROM public.attack_templates WHERE created_by = ANY(auth_user_ids_to_delete);
    DELETE FROM public.attack_nodes;
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);
    
    -- Delete auth.users last
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;