--
-- PostgreSQL database dump
--

\restrict kaECXb56ZyeI5UxxrBvcmWasBQmGFk3Ao4J5wuLioya8wPFJaCk9wvWjCxRTiI2

-- Dumped from database version 16.15 (Homebrew)
-- Dumped by pg_dump version 16.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OrderEventType; Type: TYPE; Schema: public; Owner: serviceconnect
--

CREATE TYPE public."OrderEventType" AS ENUM (
    'ORDER_CREATED',
    'PROVIDER_ACCEPTED',
    'PROVIDER_DECLINED',
    'PAYMENT_RECEIVED',
    'DATE_CHANGED',
    'SERVICE_STARTED',
    'SERVICE_COMPLETED',
    'PROVIDER_APPROVED',
    'CUSTOMER_APPROVED',
    'INVOICE_GENERATED',
    'WALLET_CREDITED',
    'ORDER_CLOSED'
);


ALTER TYPE public."OrderEventType" OWNER TO serviceconnect;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: serviceconnect
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO serviceconnect;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: serviceconnect
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'PROVIDER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO serviceconnect;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: serviceconnect
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'REVERSED'
);


ALTER TYPE public."TransactionStatus" OWNER TO serviceconnect;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: serviceconnect
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'UNVERIFIED',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."VerificationStatus" OWNER TO serviceconnect;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO serviceconnect;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "serviceId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customerApproved" boolean DEFAULT false NOT NULL,
    "customerApprovedAt" timestamp(3) without time zone,
    "providerApproved" boolean DEFAULT false NOT NULL,
    "providerApprovedAt" timestamp(3) without time zone,
    "providerAccepted" boolean DEFAULT false NOT NULL,
    "providerAcceptedAt" timestamp(3) without time zone,
    "providerDeclineReason" text,
    "providerDeclinedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    "scheduledAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone
);


ALTER TABLE public."Order" OWNER TO serviceconnect;

--
-- Name: OrderEvent; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."OrderEvent" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    type public."OrderEventType" NOT NULL,
    message text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderEvent" OWNER TO serviceconnect;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO serviceconnect;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "userId" text NOT NULL,
    "serviceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "orderId" text
);


ALTER TABLE public."Review" OWNER TO serviceconnect;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price numeric(65,30) NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "providerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Service" OWNER TO serviceconnect;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    amount numeric(65,30) NOT NULL,
    "customerId" text NOT NULL,
    "serviceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "orderId" text NOT NULL,
    status public."TransactionStatus" DEFAULT 'PENDING'::public."TransactionStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "paymentProvider" text,
    "paymentReference" text
);


ALTER TABLE public."Transaction" OWNER TO serviceconnect;

--
-- Name: User; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    phone text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "verificationStatus" public."VerificationStatus" DEFAULT 'UNVERIFIED'::public."VerificationStatus" NOT NULL,
    "verifiedAt" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO serviceconnect;

--
-- Name: VerificationRequest; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public."VerificationRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationRequest" OWNER TO serviceconnect;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: serviceconnect
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO serviceconnect;

--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderEvent OrderEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."OrderEvent"
    ADD CONSTRAINT "OrderEvent_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationRequest VerificationRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."VerificationRequest"
    ADD CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Notification_orderId_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "Notification_orderId_idx" ON public."Notification" USING btree ("orderId");


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "Notification_userId_isRead_idx" ON public."Notification" USING btree ("userId", "isRead");


--
-- Name: OrderEvent_createdAt_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "OrderEvent_createdAt_idx" ON public."OrderEvent" USING btree ("createdAt");


--
-- Name: OrderEvent_orderId_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "OrderEvent_orderId_idx" ON public."OrderEvent" USING btree ("orderId");


--
-- Name: OrderEvent_type_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "OrderEvent_type_idx" ON public."OrderEvent" USING btree (type);


--
-- Name: PasswordResetToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "PasswordResetToken_expiresAt_idx" ON public."PasswordResetToken" USING btree ("expiresAt");


--
-- Name: PasswordResetToken_token_key; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON public."PasswordResetToken" USING btree (token);


--
-- Name: PasswordResetToken_userId_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "PasswordResetToken_userId_idx" ON public."PasswordResetToken" USING btree ("userId");


--
-- Name: Review_orderId_key; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE UNIQUE INDEX "Review_orderId_key" ON public."Review" USING btree ("orderId");


--
-- Name: Transaction_orderId_key; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE UNIQUE INDEX "Transaction_orderId_key" ON public."Transaction" USING btree ("orderId");


--
-- Name: Transaction_paymentReference_key; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE UNIQUE INDEX "Transaction_paymentReference_key" ON public."Transaction" USING btree ("paymentReference");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationRequest_status_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "VerificationRequest_status_idx" ON public."VerificationRequest" USING btree (status);


--
-- Name: VerificationRequest_userId_idx; Type: INDEX; Schema: public; Owner: serviceconnect
--

CREATE INDEX "VerificationRequest_userId_idx" ON public."VerificationRequest" USING btree ("userId");


--
-- Name: Notification Notification_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderEvent OrderEvent_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."OrderEvent"
    ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PasswordResetToken PasswordResetToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Service Service_providerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Service"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VerificationRequest VerificationRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: serviceconnect
--

ALTER TABLE ONLY public."VerificationRequest"
    ADD CONSTRAINT "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict kaECXb56ZyeI5UxxrBvcmWasBQmGFk3Ao4J5wuLioya8wPFJaCk9wvWjCxRTiI2

