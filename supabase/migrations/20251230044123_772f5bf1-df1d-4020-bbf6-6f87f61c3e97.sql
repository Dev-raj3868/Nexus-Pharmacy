
-- Create bill_templates table to store template configurations
CREATE TABLE public.bill_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  pharmacy_enabled BOOLEAN NOT NULL DEFAULT true,
  drug_license_enabled BOOLEAN NOT NULL DEFAULT true,
  patient_enabled BOOLEAN NOT NULL DEFAULT true,
  item_enabled BOOLEAN NOT NULL DEFAULT true,
  gst_enabled BOOLEAN NOT NULL DEFAULT true,
  payment_enabled BOOLEAN NOT NULL DEFAULT true,
  declaration_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table to store actual bills
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bill_number TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  patient_address TEXT,
  doctor_name TEXT,
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  gst_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  template_id UUID REFERENCES public.bill_templates(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill_items table for individual items in a bill
CREATE TABLE public.bill_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  batch_no TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  gst_percent NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bill_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for bill_templates
CREATE POLICY "Users can view their own bill templates" ON public.bill_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bill templates" ON public.bill_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bill templates" ON public.bill_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bill templates" ON public.bill_templates FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for bills
CREATE POLICY "Users can view their own bills" ON public.bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bills" ON public.bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bills" ON public.bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bills" ON public.bills FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for bill_items
CREATE POLICY "Users can view their own bill items" ON public.bill_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bill items" ON public.bill_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bill items" ON public.bill_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bill items" ON public.bill_items FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_bill_templates_updated_at BEFORE UPDATE ON public.bill_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
