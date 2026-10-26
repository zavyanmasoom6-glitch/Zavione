-- ZAVI ONE ADMIN V1.4.27 — authoritative 7-day trial fix.
-- Already applied on the primary live project; kept in source for auditability.
-- Keep all previous billing event types, add only the owner-granted trial event.
ALTER TABLE public.zavi_billing_audit
  DROP CONSTRAINT IF EXISTS zavi_billing_audit_event_type_check;
ALTER TABLE public.zavi_billing_audit
  ADD CONSTRAINT zavi_billing_audit_event_type_check CHECK (
    event_type IN ('annual_payment','semiannual_payment','lifetime_payment','status_change','trial_7_days')
  );

CREATE OR REPLACE FUNCTION public.zavi_admin_preview_trial_7days(p_workspace_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_expires timestamptz; v_plan text; v_status text; v_projected timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT private.zavi_is_billing_admin() THEN
    RAISE EXCEPTION 'Central administrator only' USING ERRCODE='42501';
  END IF;
  IF p_workspace_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.zavi_workspaces w WHERE w.id=p_workspace_id
  ) THEN RAISE EXCEPTION 'Workspace not found' USING ERRCODE='22023'; END IF;
  SELECT s.expires_at,s.plan,s.status INTO v_expires,v_plan,v_status
  FROM public.zavi_subscriptions s WHERE s.workspace_id=p_workspace_id;
  IF v_plan='lifetime' THEN
    RETURN jsonb_build_object('workspace_id',p_workspace_id,'has_subscription',true,
      'plan','lifetime','status',v_status,'current_expires_at',null,
      'proposed_expires_at',null,'can_extend',false,'reason','lifetime','server_time',now());
  END IF;
  v_projected:=greatest(now(),coalesce(v_expires,now()))+interval '7 days';
  RETURN jsonb_build_object('workspace_id',p_workspace_id,
    'has_subscription',v_plan IS NOT NULL,'plan',v_plan,'status',v_status,
    'current_expires_at',v_expires,'proposed_expires_at',v_projected,
    'can_extend',true,'granted_days',7,'server_time',now());
END $$;
REVOKE ALL ON FUNCTION public.zavi_admin_preview_trial_7days(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.zavi_admin_preview_trial_7days(uuid) TO authenticated;
