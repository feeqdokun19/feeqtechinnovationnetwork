BEGIN;

-- ============================================================
-- 1. Build mapping from every legacy User ID to its final
--    Docker User ID.
--
-- Duplicate emails keep the existing Docker User ID.
-- New users keep their original legacy User ID.
-- ============================================================

CREATE TEMP TABLE user_id_map (
    old_id TEXT PRIMARY KEY,
    target_id TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO user_id_map (old_id, target_id)
SELECT
    l.id AS old_id,
    COALESCE(p.id, l.id) AS target_id
FROM legacy."User" l
LEFT JOIN public."User" p
    ON LOWER(p.email) = LOWER(l.email);

-- Safety check: every legacy user must have a target ID.
DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO missing_count
    FROM legacy."User" l
    LEFT JOIN user_id_map m ON m.old_id = l.id
    WHERE m.target_id IS NULL;

    IF missing_count > 0 THEN
        RAISE EXCEPTION
            'Migration stopped: % legacy users have no target ID',
            missing_count;
    END IF;
END $$;


-- ============================================================
-- 2. Update passwords for duplicate users.
--
-- Keep the current Docker User ID/profile/data, but restore
-- the password hash from the legacy database.
-- ============================================================

UPDATE public."User" p
SET password = l.password
FROM legacy."User" l
JOIN user_id_map m
    ON m.old_id = l.id
WHERE p.id = m.target_id
  AND m.old_id <> m.target_id;


-- ============================================================
-- 3. Insert legacy-only users.
--
-- Duplicate users are excluded because their Docker accounts
-- already exist.
-- ============================================================

INSERT INTO public."User" (
    id,
    name,
    email,
    password,
    phone,
    role,
    "createdAt",
    "updatedAt",
    "verificationStatus",
    "verifiedAt"
)
SELECT
    l.id,
    l.name,
    l.email,
    l.password,
    l.phone,
    l.role,
    l."createdAt",
    l."updatedAt",
    l."verificationStatus",
    l."verifiedAt"
FROM legacy."User" l
JOIN user_id_map m
    ON m.old_id = l.id
WHERE m.old_id = m.target_id;


-- ============================================================
-- 4. Migrate Services.
--
-- providerId is remapped through user_id_map.
-- ============================================================

INSERT INTO public."Service" (
    id,
    title,
    description,
    price,
    category,
    status,
    "providerId",
    "createdAt",
    "updatedAt"
)
SELECT
    l.id,
    l.title,
    l.description,
    l.price,
    l.category,
    l.status,
    m.target_id,
    l."createdAt",
    l."updatedAt"
FROM legacy."Service" l
JOIN user_id_map m
    ON m.old_id = l."providerId";


-- ============================================================
-- 5. Migrate Orders.
--
-- customerId is remapped.
-- serviceId remains unchanged because the ID collision check
-- already confirmed there are no service ID collisions.
-- ============================================================

INSERT INTO public."Order" (
    id,
    "customerId",
    "serviceId",
    amount,
    status,
    notes,
    "createdAt",
    "updatedAt",
    "customerApproved",
    "customerApprovedAt",
    "providerApproved",
    "providerApprovedAt",
    "providerAccepted",
    "providerAcceptedAt",
    "providerDeclineReason",
    "providerDeclinedAt",
    "closedAt",
    "completedAt",
    "paidAt",
    "scheduledAt",
    "startedAt"
)
SELECT
    l.id,
    m.target_id,
    l."serviceId",
    l.amount,
    l.status,
    l.notes,
    l."createdAt",
    l."updatedAt",
    l."customerApproved",
    l."customerApprovedAt",
    l."providerApproved",
    l."providerApprovedAt",
    l."providerAccepted",
    l."providerAcceptedAt",
    l."providerDeclineReason",
    l."providerDeclinedAt",
    l."closedAt",
    l."completedAt",
    l."paidAt",
    l."scheduledAt",
    l."startedAt"
FROM legacy."Order" l
JOIN user_id_map m
    ON m.old_id = l."customerId";


-- ============================================================
-- 6. Migrate Notifications.
-- ============================================================

INSERT INTO public."Notification" (
    id,
    "userId",
    "orderId",
    type,
    title,
    message,
    "isRead",
    "createdAt",
    "updatedAt"
)
SELECT
    l.id,
    m.target_id,
    l."orderId",
    l.type,
    l.title,
    l.message,
    l."isRead",
    l."createdAt",
    l."updatedAt"
FROM legacy."Notification" l
JOIN user_id_map m
    ON m.old_id = l."userId";


-- ============================================================
-- 7. Migrate Order Events.
-- ============================================================

INSERT INTO public."OrderEvent" (
    id,
    "orderId",
    type,
    message,
    "createdAt"
)
SELECT
    l.id,
    l."orderId",
    l.type,
    l.message,
    l."createdAt"
FROM legacy."OrderEvent" l;


-- ============================================================
-- 8. Migrate Password Reset Tokens.
--
-- Currently zero legacy records, but keep this migration
-- complete for future use.
-- ============================================================

INSERT INTO public."PasswordResetToken" (
    id,
    token,
    "userId",
    "expiresAt",
    "createdAt"
)
SELECT
    l.id,
    l.token,
    m.target_id,
    l."expiresAt",
    l."createdAt"
FROM legacy."PasswordResetToken" l
JOIN user_id_map m
    ON m.old_id = l."userId";


-- ============================================================
-- 9. Migrate Reviews.
-- ============================================================

INSERT INTO public."Review" (
    id,
    rating,
    comment,
    "userId",
    "serviceId",
    "createdAt",
    "orderId"
)
SELECT
    l.id,
    l.rating,
    l.comment,
    m.target_id,
    l."serviceId",
    l."createdAt",
    l."orderId"
FROM legacy."Review" l
JOIN user_id_map m
    ON m.old_id = l."userId";


-- ============================================================
-- 10. Migrate Transactions.
-- ============================================================

INSERT INTO public."Transaction" (
    id,
    amount,
    "customerId",
    "serviceId",
    "createdAt",
    "updatedAt",
    "orderId",
    status,
    "paidAt",
    "paymentProvider",
    "paymentReference"
)
SELECT
    l.id,
    l.amount,
    m.target_id,
    l."serviceId",
    l."createdAt",
    l."updatedAt",
    l."orderId",
    l.status,
    l."paidAt",
    l."paymentProvider",
    l."paymentReference"
FROM legacy."Transaction" l
JOIN user_id_map m
    ON m.old_id = l."customerId";


-- ============================================================
-- 11. Migrate Verification Requests.
-- ============================================================

INSERT INTO public."VerificationRequest" (
    id,
    "userId",
    status,
    "submittedAt",
    "reviewedAt",
    "rejectionReason",
    "createdAt",
    "updatedAt"
)
SELECT
    l.id,
    m.target_id,
    l.status,
    l."submittedAt",
    l."reviewedAt",
    l."rejectionReason",
    l."createdAt",
    l."updatedAt"
FROM legacy."VerificationRequest" l
JOIN user_id_map m
    ON m.old_id = l."userId";


-- ============================================================
-- 12. Verify the resulting counts before committing.
-- ============================================================

DO $$
DECLARE
    actual_users INTEGER;
    actual_services INTEGER;
    actual_orders INTEGER;
    actual_transactions INTEGER;
    actual_reviews INTEGER;
    actual_notifications INTEGER;
    actual_order_events INTEGER;
    actual_password_reset_tokens INTEGER;
    actual_verification_requests INTEGER;
BEGIN
    SELECT COUNT(*) INTO actual_users
    FROM public."User";

    SELECT COUNT(*) INTO actual_services
    FROM public."Service";

    SELECT COUNT(*) INTO actual_orders
    FROM public."Order";

    SELECT COUNT(*) INTO actual_transactions
    FROM public."Transaction";

    SELECT COUNT(*) INTO actual_reviews
    FROM public."Review";

    SELECT COUNT(*) INTO actual_notifications
    FROM public."Notification";

    SELECT COUNT(*) INTO actual_order_events
    FROM public."OrderEvent";

    SELECT COUNT(*) INTO actual_password_reset_tokens
    FROM public."PasswordResetToken";

    SELECT COUNT(*) INTO actual_verification_requests
    FROM public."VerificationRequest";

    IF actual_users <> 19 THEN
        RAISE EXCEPTION
            'User count verification failed: expected 19, got %',
            actual_users;
    END IF;

    IF actual_services <> 17 THEN
        RAISE EXCEPTION
            'Service count verification failed: expected 17, got %',
            actual_services;
    END IF;

    IF actual_orders <> 25 THEN
        RAISE EXCEPTION
            'Order count verification failed: expected 25, got %',
            actual_orders;
    END IF;

    IF actual_transactions <> 24 THEN
        RAISE EXCEPTION
            'Transaction count verification failed: expected 24, got %',
            actual_transactions;
    END IF;

    IF actual_reviews <> 1 THEN
        RAISE EXCEPTION
            'Review count verification failed: expected 1, got %',
            actual_reviews;
    END IF;

    IF actual_notifications <> 12 THEN
        RAISE EXCEPTION
            'Notification count verification failed: expected 12, got %',
            actual_notifications;
    END IF;

    IF actual_order_events <> 4 THEN
        RAISE EXCEPTION
            'OrderEvent count verification failed: expected 4, got %',
            actual_order_events;
    END IF;

    IF actual_password_reset_tokens <> 0 THEN
        RAISE EXCEPTION
            'PasswordResetToken count verification failed: expected 0, got %',
            actual_password_reset_tokens;
    END IF;

    IF actual_verification_requests <> 0 THEN
        RAISE EXCEPTION
            'VerificationRequest count verification failed: expected 0, got %',
            actual_verification_requests;
    END IF;

    RAISE NOTICE 'Migration verification passed.';
    RAISE NOTICE 'Users: %', actual_users;
    RAISE NOTICE 'Services: %', actual_services;
    RAISE NOTICE 'Orders: %', actual_orders;
    RAISE NOTICE 'Transactions: %', actual_transactions;
    RAISE NOTICE 'Reviews: %', actual_reviews;
    RAISE NOTICE 'Notifications: %', actual_notifications;
    RAISE NOTICE 'OrderEvents: %', actual_order_events;
    RAISE NOTICE 'PasswordResetTokens: %', actual_password_reset_tokens;
    RAISE NOTICE 'VerificationRequests: %', actual_verification_requests;
END $$;

COMMIT;
