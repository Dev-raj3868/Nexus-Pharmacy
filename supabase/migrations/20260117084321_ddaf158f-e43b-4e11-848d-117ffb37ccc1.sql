-- Create debit_credit_notes table
CREATE TABLE public.debit_credit_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  note_id TEXT NOT NULL,
  note_type TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_order_id TEXT,
  reason TEXT,
  received_id TEXT,
  total NUMERIC DEFAULT 0,
  vendor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debit_credit_items table
CREATE TABLE public.debit_credit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  debit_credit_note_id UUID NOT NULL REFERENCES public.debit_credit_notes(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  batch_no TEXT,
  gst TEXT,
  reason TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on debit_credit_notes
ALTER TABLE public.debit_credit_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for debit_credit_notes
CREATE POLICY "Users can view their own debit credit notes" 
ON public.debit_credit_notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debit credit notes" 
ON public.debit_credit_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debit credit notes" 
ON public.debit_credit_notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debit credit notes" 
ON public.debit_credit_notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on debit_credit_items
ALTER TABLE public.debit_credit_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for debit_credit_items
CREATE POLICY "Users can view their own debit credit items" 
ON public.debit_credit_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debit credit items" 
ON public.debit_credit_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debit credit items" 
ON public.debit_credit_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debit credit items" 
ON public.debit_credit_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_debit_credit_notes_updated_at
BEFORE UPDATE ON public.debit_credit_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();